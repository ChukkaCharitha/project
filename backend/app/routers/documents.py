from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Document, DocumentChunk, User
from ..schemas import DocumentOut
from ..services.document_service import extract_text, split_into_chunks
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
import os

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filename_lower = file.filename.lower()
    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files allowed")

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    text = extract_text(contents, file.filename)

    if not text or len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    # Delete old doc with same name for this user
    existing = db.query(Document).filter(
        Document.filename == file.filename,
        Document.user_id == current_user.id
    ).first()
    if existing:
        db.query(DocumentChunk).filter(DocumentChunk.document_id == existing.id).delete()
        db.delete(existing)
        db.commit()

    doc = Document(filename=file.filename, content=text, user_id=current_user.id)
    db.add(doc)
    db.commit()
    db.refresh(doc)

    chunks = split_into_chunks(text)
    for i, chunk in enumerate(chunks):
        db.add(DocumentChunk(document_id=doc.id, chunk_text=chunk, chunk_index=i))
    db.commit()

    return doc

@router.get("/", response_model=list[DocumentOut])
def get_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete chunks first
    db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).delete()
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted", "id": document_id}