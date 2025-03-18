import os
import json
import numpy as np  # type: ignore
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import google.generativeai as genai  # type: ignore
from dotenv import load_dotenv
import os

# 載入 .env 檔案中的環境變數
load_dotenv()


# 配置 Google Generative AI API 金鑰與模型
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-embedding-exp-03-07')

# 初始化 Supabase 用戶端（請將環境變數 SUPABASE_URL 與 SUPABASE_KEY 設定好）
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


# Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")


class AskRequest(BaseModel):
    question: str


def get_embedding(text: str):
    """
    根據輸入文本產生向量表示（embedding）
    """
    response = model.generate_content(text)
    # 假設 response 中有 embedding 欄位
    return response.embedding


def cosine_similarity(vec1, vec2):
    """計算兩向量間的餘弦相似度"""
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(vec1, vec2) / (norm1 * norm2))


def get_relevant_chunks(query_embedding, top_k=3):
    """
    從 Supabase 中取得所有文件區塊，計算與 query_embedding 的相似度，
    並返回最相關的 top_k 筆結果。
    """
    response = supabase.table("document_chunks").select("*").execute()
    if response.error:
        raise HTTPException(
            status_code=500, detail="Error fetching document chunks")
    chunks = response.data

    # 計算每個區塊與查詢向量間的相似度
    for chunk in chunks:
        embedding = chunk.get("embedding")
        if isinstance(embedding, str):
            try:
                embedding = json.loads(embedding)
            except Exception:
                embedding = []
        chunk["similarity"] = cosine_similarity(
            query_embedding, embedding) if embedding else 0.0

    # 按相似度由高到低排序並取前 top_k 筆
    sorted_chunks = sorted(chunks, key=lambda x: x["similarity"], reverse=True)
    return sorted_chunks[:top_k]


def generate_answer(prompt: str):
    """
    依據上下文提示字串向 LLM 請求生成答案
    """
    response = model.generate_content(prompt)
    # 假設回應中有 text 欄位
    return response.text


@app.post("/ask")
async def ask_question(request: AskRequest):
    question = request.question
    # 產生查詢向量
    query_embedding = get_embedding(question)
    # 取得最相關的區塊
    relevant_chunks = get_relevant_chunks(query_embedding)
    context = "\n".join([chunk.get("content", "")
                        for chunk in relevant_chunks])
    # 建立帶上下文的提示字串
    prompt = f"Answer the question based on the provided context:\n{context}\nQuestion: {question}"
    answer = generate_answer(prompt)
    return {"answer": answer}
