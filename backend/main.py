from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from hashlib import pbkdf2_hmac
import os

from database import engine, SessionLocal
import models
import schemas


# Create database tables
models.Base.metadata.create_all(bind=engine)


# FastAPI application
app = FastAPI(
    title="Employee Task Management System",
    description="Backend API for managing employees and tasks",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://employee-task-management-system-rust.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CORS - allows React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# JWT configuration
SECRET_KEY = "ETMS_SECRET_KEY_CHANGE_LATER"
ALGORITHM = "HS256"

security = HTTPBearer()


# Database dependency
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# Password hashing
def hash_password(password: str) -> str:
    salt = os.urandom(16)

    password_hash = pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        100000
    )

    return salt.hex() + ":" + password_hash.hex()


# Password verification
def verify_password(password: str, stored_password: str) -> bool:
    try:
        salt_hex, hash_hex = stored_password.split(":")

        salt = bytes.fromhex(salt_hex)

        password_hash = pbkdf2_hmac(
            "sha256",
            password.encode(),
            salt,
            100000
        )

        return password_hash.hex() == hash_hex

    except Exception:
        return False


# Create JWT token
def create_token(user):
    data = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }

    return jwt.encode(
        data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# Get currently logged-in user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "ETMS Backend Running"
    }


# --------------------------------------------------
# REGISTER
# --------------------------------------------------

@app.post("/register")
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role
    }


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@app.post("/login")
def login_user(
    user: schemas.UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_token(existing_user)

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user_id": existing_user.id,
        "name": existing_user.name,
        "role": existing_user.role
    }


# --------------------------------------------------
# CREATE TASK
# --------------------------------------------------

@app.post("/tasks")
def create_task(
    task: schemas.TaskCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if task.assigned_to:

        employee = db.query(models.User).filter(
            models.User.id == task.assigned_to
        ).first()

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Assigned employee not found"
            )

    new_task = models.Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        assigned_to=task.assigned_to,
        created_by=current_user.id,
        status="Pending"
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task created successfully",
        "task_id": new_task.id,
        "title": new_task.title,
        "description": new_task.description,
        "status": new_task.status,
        "priority": new_task.priority,
        "assigned_to": new_task.assigned_to,
        "created_by": new_task.created_by
    }


# --------------------------------------------------
# GET ALL TASKS
# --------------------------------------------------

@app.get("/tasks")
def get_tasks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return db.query(models.Task).all()


# --------------------------------------------------
# GET MY TASKS
# --------------------------------------------------

@app.get("/my-tasks")
def get_my_tasks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return db.query(models.Task).filter(
        models.Task.assigned_to == current_user.id
    ).all()


# --------------------------------------------------
# GET SINGLE TASK
# --------------------------------------------------

@app.get("/tasks/{task_id}")
def get_task(
    task_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


# --------------------------------------------------
# UPDATE TASK
# --------------------------------------------------

@app.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    task_data: schemas.TaskUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if task_data.title is not None:
        task.title = task_data.title

    if task_data.description is not None:
        task.description = task_data.description

    if task_data.status is not None:

        allowed_status = [
            "Pending",
            "In Progress",
            "Completed"
        ]

        if task_data.status not in allowed_status:
            raise HTTPException(
                status_code=400,
                detail="Invalid status"
            )

        task.status = task_data.status

    if task_data.priority is not None:

        allowed_priority = [
            "Low",
            "Medium",
            "High"
        ]

        if task_data.priority not in allowed_priority:
            raise HTTPException(
                status_code=400,
                detail="Invalid priority"
            )

        task.priority = task_data.priority

    if task_data.assigned_to is not None:

        employee = db.query(models.User).filter(
            models.User.id == task_data.assigned_to
        ).first()

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Employee not found"
            )

        task.assigned_to = task_data.assigned_to

    db.commit()
    db.refresh(task)

    return {
        "message": "Task updated successfully",
        "task": task
    }


# --------------------------------------------------
# DELETE TASK
# --------------------------------------------------

@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }


# --------------------------------------------------
# ASSIGN TASK
# --------------------------------------------------

@app.put("/tasks/{task_id}/assign/{employee_id}")
def assign_task(
    task_id: int,
    employee_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    employee = db.query(models.User).filter(
        models.User.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    task.assigned_to = employee_id

    db.commit()
    db.refresh(task)

    return {
        "message": "Task assigned successfully",
        "task_id": task.id,
        "assigned_to": employee_id
    }


# --------------------------------------------------
# DASHBOARD
# --------------------------------------------------

@app.get("/dashboard")
def dashboard(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    total_tasks = db.query(models.Task).count()

    pending_tasks = db.query(models.Task).filter(
        models.Task.status == "Pending"
    ).count()

    in_progress_tasks = db.query(models.Task).filter(
        models.Task.status == "In Progress"
    ).count()

    completed_tasks = db.query(models.Task).filter(
        models.Task.status == "Completed"
    ).count()

    total_users = db.query(models.User).count()

    return {
        "total_users": total_users,
        "total_tasks": total_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "completed_tasks": completed_tasks
    }