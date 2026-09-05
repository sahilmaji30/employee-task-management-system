from pydantic import BaseModel, EmailStr
from typing import Optional


# -------------------------
# USER SCHEMAS
# -------------------------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "employee"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -------------------------
# TASK SCHEMAS
# -------------------------

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "Medium"
    assigned_to: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None