from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, DocumentChunk, Conversation, Document
from ..schemas import ChatRequest, ChatResponse
from ..services.ai_service import get_ai_answer
from ..routers.documents import get_current_user

router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
def ask_question(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get relevant chunks
    if request.document_id:
        chunks = db.query(DocumentChunk).filter(
            DocumentChunk.document_id == request.document_id
        ).all()
    else:
        # Get all chunks from user's documents
        doc_ids = [d.id for d in db.query(Document).filter(Document.user_id == current_user.id).all()]
        chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id.in_(doc_ids)).all()

    if not chunks:
        raise HTTPException(status_code=404, detail="No documents found. Please upload a document first.")

    # Build context from chunks (simple keyword match for now)
    question_lower = request.question.lower()
    relevant = [c for c in chunks if any(word in c.chunk_text.lower() for word in question_lower.split())]
    if not relevant:
        relevant = chunks[:5]  # fallback: use first 5 chunks

    context = "\n\n".join([c.chunk_text for c in relevant[:5]])
    sources = list(set([str(c.document_id) for c in relevant[:5]]))

    answer = get_ai_answer(request.question, context)

    # Save conversation
    db.add(Conversation(
        user_id=current_user.id,
        question=request.question,
        answer=answer
    ))
    db.commit()

    return ChatResponse(answer=answer, sources=sources)

@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.created_at.desc()).limit(50).all()
    return history