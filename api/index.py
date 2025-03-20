import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from pydantic import BaseModel
import supabase
from supabase import create_client
import voyageai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from pypdf import PdfReader
import uuid
import json
from io import BytesIO
import httpx
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
supabase_key = os.environ.get("SUPABASE_ANON_KEY")
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
async def process_pdf(object_key: str = Body(...)):
    try:
        # 创建 BytesIO 对象保存下载内容
        bucket_name = "brain-note-storage"
        pdf_stream = BytesIO()

        # 从 R2 下载文件到 BytesIO
        s3_client.download_fileobj(bucket_name, object_key, pdf_stream)

        # 将文件指针重置到开头
        pdf_stream.seek(0)

        # 使用 PdfReader 读取 PDF
        reader = PdfReader(pdf_stream)

        # 提取总文本
        total_text = ""
        for page in reader.pages:
            total_text += page.extract_text() + "\n"

        # 提取前两页用于元数据
        metadata_text = ""
        for i in range(min(2, len(reader.pages))):
            metadata_text += reader.pages[i].extract_text() + "\n"

        # 构造元数据提取提示
        metadata_prompt = f"""
        从提供的文本中提取以下书目信息：
        - Title
        - Authors
        - Journal Name
        - Year
        - DOI
        以 JSON 格式提供答案，键为：title, authors, journal_name, year, doi
        Text: {metadata_text}
        """
        metadata_message = HumanMessage(content=metadata_prompt)
        metadata_response = llm.invoke([metadata_message])
        try:
            metadata = json.loads(metadata_response.content)
        except json.JSONDecodeError:
            metadata = {"title": "", "authors": "", "journal_name": "", "year": "", "doi": ""}

        # 插入到 pdfs 表
        pdf_id = str(uuid.uuid4())
        year_str = metadata.get("year", "")
        if year_str.isdigit():
            year = int(year_str)
        else:
            year = None

        supabase_client.table("pdfs").insert({
            "id": pdf_id,
            "title": metadata.get("title", ""),
            "authors": metadata.get("authors", ""),
            "journal_name": metadata.get("journal_name", ""),
            "year": year,
            "doi": metadata.get("doi", "")
        }).execute()

        # 将文本分割成块，每块 512 字符
        chunk_size = 512
        chunks = [total_text[i:i+chunk_size] for i in range(0, len(total_text), chunk_size)]

        for i, chunk in enumerate(chunks):
            # 生成嵌入
            embedding_result = voyage_client.embed([chunk], model="voyage-3-large")
            embedding = embedding_result.embeddings[0]

            # 插入到 chunks 表
            supabase_client.table("chunks").insert({
                "id": str(uuid.uuid4()),
                "pdf_id": pdf_id,
                "chunk_number": i,
                "text": chunk,
                "embedding": embedding
            }).execute()

        return {"message": "PDF processed successfully", "pdf_id": pdf_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"下載或處理過程中發生錯誤：{str(e)}")


@app.post("/api/py/query")
async def query(request: QueryRequest):
    user_query = request.query

    # 生成查询嵌入
    query_embedding_result = voyage_client.embed(
        [user_query], model="voyage-2")
    query_embedding = query_embedding_result.embeddings[0]

    # 搜索前 5 个最相似的块
    result = supabase_client.rpc(
        "match_chunks", {"query_embedding": query_embedding, "limit_num": 5}).execute()
    top_chunks = result.data

    # 获取顶部块的文本
    context = "\n".join([chunk["text"] for chunk in top_chunks])

    # 为 LLM 创建提示
    prompt = f"""
    根据提供的上下文回答以下问题：
    Question: {user_query}
    Context: {context}
    """
    message = HumanMessage(content=prompt)
    response = llm.invoke([message])

    return {"answer": response.content}
