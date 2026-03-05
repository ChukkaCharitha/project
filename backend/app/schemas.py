from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class DocumentOut(BaseModel):
    id: int
    filename: str
    created_at: datetime
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    question: str
    document_id: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []