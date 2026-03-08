import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

def get_ai_answer(question: str, context: str, chat_history: list = None) -> str:
    # Build conversation history messages
    messages = [
        {
            "role": "system",
            "content": """You are KnowledgeAI — an expert document analyst and intelligent assistant.

Your capabilities:
- Search and analyze across MULTIPLE documents simultaneously
- Understand the TRUE INTENT behind user questions, not just keywords
- Give detailed, structured, comprehensive answers
- Remember conversation context and refer back to previous questions
- Cross-reference information from different documents

STRICT RULES:
1. ALWAYS read the full context carefully before answering
2. Understand what the user TRULY wants to know — their intent, not just surface keywords
3. If a question is vague, interpret it in the most helpful way possible
4. Search ALL provided document chunks for relevant information
5. Give structured answers: use bullet points, numbered lists, or sections when helpful
6. If information spans multiple documents, mention which document it comes from
7. If you find partial information, share what you found and note what's missing
8. NEVER make up information not in the documents
9. If truly not found: say "I couldn't find this in your uploaded documents. Try rephrasing or upload a relevant document."
10. Always be conversational, helpful, and professional
11. For follow-up questions, refer back to the conversation history for context

ANSWER FORMAT GUIDE:
- Simple factual question → Direct 1-2 sentence answer
- "What is / Explain" → Clear explanation with examples from the document
- "List / What are" → Numbered or bulleted list
- "Summary / Summarize" → Structured summary with key sections
- "Compare" → Side-by-side comparison
- "How to / Steps" → Step-by-step numbered instructions"""
        }
    ]

    # Add conversation history for context memory
    if chat_history:
        for msg in chat_history[-6:]:  # Last 6 messages for context
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

    # Add current question with document context
    messages.append({
        "role": "user",
        "content": f"""DOCUMENT CONTEXT (search ALL of this carefully):
---
{context}
---

USER QUESTION: {question}

Instructions: 
- Understand the true intent of this question
- Search through ALL the document context above
- Give a comprehensive, well-structured answer
- If this relates to a previous question in our conversation, connect the information
- Be specific and detailed, not vague"""
    })

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=2048,
        temperature=0.2,
        top_p=0.9,
    )

    return response.choices[0].message.content