import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

def get_ai_answer(question: str, context: str) -> str:
    prompt = f"""You are a helpful AI knowledge assistant.
Use ONLY the context below to answer the user's question.
If the answer is not in the context, say "I couldn't find that in the uploaded documents."

Context:
{context}

Question: {question}

Answer:"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024
    )
    return response.choices[0].message.content
