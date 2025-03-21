import os
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from supabase import create_client
import voyageai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from pypdf import PdfReader
import uuid
import json
from io import BytesIO
from dotenv import load_dotenv
import boto3
from botocore.config import Config


load_dotenv()


# Create FastAPI instance with custom docs and openapi url
# 从环境变量中获取 Cloudflare R2 的配置信息
endpoint_url = os.environ.get('NEXT_PUBLIC_R2_ENDPOINT')
access_key_id = os.environ.get('NEXT_PUBLIC_ACCESS_KEY_ID')
secret_access_key = os.environ.get('NEXT_PUBLIC_SECRET_ACCESS_KEY')

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase_client = create_client(supabase_url, supabase_key)

voyage_api_key = os.environ.get("VOYAGE_API_KEY")
voyage_client = voyageai.Client(api_key=voyage_api_key)

gemini_api_key = os.environ.get("GOOGLE_API_KEY")
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash", google_api_key=gemini_api_key)

s3_client = boto3.client(
    's3',
    endpoint_url=endpoint_url,
    aws_access_key_id=access_key_id,
    aws_secret_access_key=secret_access_key,
    config=Config(signature_version='s3v4'),
    region_name='auto'
)

app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

# 配置 R2 客戶端


class QueryRequest(BaseModel):
    query: str


@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

@app.post("/api/py/process_pdf")
async def process_pdf(object_key: str = Body(..., embed=True)):

    try:
        print("Starting to download PDF from R2")
        bucket_name = "brain-note-storage"
        pdf_stream = BytesIO()

        # 從 Cloudflare R2 下載 PDF 到 BytesIO
        s3_client.download_fileobj(bucket_name, object_key, pdf_stream)
        print("PDF downloaded successfully")

        # 將檔案指標重置到開頭
        pdf_stream.seek(0)
        print("Creating PdfReader")

        # 使用 PdfReader 讀取 PDF
        reader = PdfReader(pdf_stream)
        print("PdfReader created successfully")

        print("Extracting total text")
        total_text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                total_text += page_text + "\n"
            print("Total text extracted")

        # 將全文分割為每塊 512 個字元的文本
        chunk_size = 512
        chunks = [total_text[i:i + chunk_size] for i in range(0, len(total_text), chunk_size)]

        # 處理每個文本塊：生成嵌入並存入 Supabase 的 chunks 表中
        for i, chunk in enumerate(chunks):
            # 呼叫 Voyage API 生成嵌入
            embedding_result = voyage_client.embed([chunk], model="voyage-3-large")
            embedding = embedding_result.embeddings[0]

            # 根據 object_key 查找對應的 PDF id
            pdf_result = supabase_client.table("Document").select("id").eq("objectKey", object_key).execute()
            if pdf_result.data and len(pdf_result.data) > 0:
                pdf_id = pdf_result.data[0]['id']
            else:
                raise Exception("未找到 PDF id")
            # 插入每個文本塊到 chunks 表中
            supabase_client.table("chunks").insert({
                "id": str(uuid.uuid4()),
                "pdf_id": pdf_id,
                "chunk_number": i,
                "text": chunk,
                "embedding": embedding
            }).execute()

        # --------------------------
        # 接下來開始提取元數據
        # --------------------------
        # 使用固定的查詢文本生成查詢嵌入
        query_text = "  請提取以下欄位：Title（標題）Authors（作者）Abstract（摘要）"
        query_embedding_result = voyage_client.embed([query_text], model="voyage-3-large")
        query_embedding = query_embedding_result.embeddings[0]

        # 透過 RPC 呼叫 match_chunks，取得與查詢最相似的前 5 個文本塊
        result = supabase_client.rpc(
            "match_chunks", {"query_embedding": query_embedding, "limit_num": 5}
        ).execute()
        top_chunks = result.data

        # 將取得的文本塊組合成上下文
        context = "\n".join([chunk["text"] for chunk in top_chunks])

        # 修改 metadata_prompt，強調只返回 JSON 且不要包含額外文字
        metadata_prompt = f"""
        請依據下方提供的內容（Context）提取書目信息，並僅以純文字格式返回符合下列 JSON 結構的內容。請勿輸出任何多餘說明、標題或標記。

        請提取以下欄位：

        title（標題）
        authors（作者）
        abstract（摘要）
        JSON 格式範例如下：
        {{
        "title": "",
        "authors": "",
        "abstract": ""
        }}
        注意事項：

        僅根據提供的 Context 作答，不得使用外部資料或推論。
        如有資料缺漏，請將該欄位保留為空字串（""）。
        若作者有多位，請使用**全形逗號（，）**分隔。
        摘要需簡明扼要，重點整理即可，避免過多細節。
        僅返回 JSON 格式的純文字，不得加入註解、說明或其他額外內容。
        以下是內容（Context）：
        {context}
        """

        # 呼叫 LLM 生成元數據
        from langchain_core.messages import HumanMessage
        metadata_message = HumanMessage(content=metadata_prompt)
        metadata_response = llm.invoke([metadata_message])
        response_content = metadata_response.content.strip()

        # 使用正則表達式提取 JSON 區塊（以防有多餘的 markdown 標記）
        import re
        match = re.search(r"\{.*\}", response_content, re.DOTALL)
        if match:
            json_text = match.group()
        else:
            json_text = response_content

        try:
            metadata = json.loads(json_text)
        except json.JSONDecodeError:
            metadata = {"title": "", "authors": "", "abstract": ""}
            
   

        # 根據 object_key 更新 Document 表中的資料
        supabase_client.table("Document").update(metadata).eq("objectKey", object_key).execute()

        return {"message": "PDF processed successfully"}
    except Exception as e:
        print(f"Error occurred: {type(e).__name__} - {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"error：{type(e).__name__} - {str(e)}"
        )


@app.post("/api/py/query")
async def query(request: QueryRequest):
    user_query = request.query

    # 生成查詢嵌入
    query_embedding_result = voyage_client.embed(
        [user_query], model="voyage-3-large")
    query_embedding = query_embedding_result.embeddings[0]

    # 搜索前 5 个最相似塊
    result = supabase_client.rpc(
        "match_chunks", {"query_embedding": query_embedding, "limit_num": 5}).execute()
    top_chunks = result.data

    # 或取頂部塊的文本
    context = "\n".join([chunk["text"] for chunk in top_chunks])

        # 構造 LLM 提示（調整字串格式，避免縮排問題）
    prompt = (
            "You are an intelligent assistant skilled in reading comprehension and information extraction. "
            "Your task is to analyze the context provided below, extract the most relevant and accurate information to answer the user’s question, "
            "and present your answer in a clear, structured Markdown format.\n\n"
            "### Instructions:\n"
            "1. Carefully extract key information from the given context that directly relates to the question.\n"
            "2. Structure your answer clearly using **Markdown**, including:\n"
            "   - Appropriate headings (e.g., `## Answer`, `### Key Points`)\n"
            "   - Lists, bullet points, tables, code blocks, or blockquotes where useful\n"
            "3. If the context lacks sufficient information to fully answer the question, **clearly state the limitations** and avoid making unsupported assumptions.\n"
            "4. **Answer in the same language used in the question.** If the language is unclear or mixed, default to **Traditional Chinese**.\n\n"
            "---\n\n"
            "**Question:**\n"
            f"{user_query}\n\n"
            "**Context:**\n"
            f"{context}\n\n"
            "---\n\n"
            "Please output your full answer in **Markdown format**:"
        )
    message = HumanMessage(content=prompt)
    response = llm.invoke([message])

    return {"answer": response.content}
