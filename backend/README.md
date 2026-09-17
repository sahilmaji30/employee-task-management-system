# Employee Task Management System (ETMS)

A full-stack web application for managing employees and their tasks. The system allows users to register and log in, create and assign tasks, track task status, and monitor tasks through a dashboard.

## 🚀 Features

* User registration and login
* Secure user authentication
* Employee management
* Create and assign tasks
* View assigned tasks
* Update task status
* Dashboard for task management
* Persistent data storage using SQLite
* REST API using FastAPI
* Interactive frontend built with React
* Responsive and user-friendly interface

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* JWT Authentication

### Development Tools

* Git & GitHub
* Visual Studio Code
* Postman / Swagger UI

## 📁 Project Structure

```text
employee-task-management-system/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── README.md
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/sahilmaji30/employee-task-management-system.git
cd employee-task-management-system
```

---

## 🔧 Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

### Windows

```bash
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

### API Documentation

FastAPI provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

---

## 💻 Frontend Setup

Open a second terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install the required packages:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🔄 Application Workflow

```text
Register
   ↓
Login
   ↓
Dashboard
   ↓
Create Task
   ↓
Assign Employee
   ↓
Track Task
   ↓
Update Status
   ↓
Complete Task
```

## 📊 Main Modules

### Authentication

Users can register and log in using their credentials.

### Dashboard

Provides an overview of tasks and their current status.

### Task Management

Users can create tasks, assign them to employees, view tasks, and update their status.

### Database

The application uses SQLite with SQLAlchemy for storing user and task information.

## 🔐 Authentication

The backend uses JWT-based authentication to protect authenticated API operations.

Passwords are securely hashed before being stored.

## 🧪 Testing

The project was tested for:

* User registration
* User login
* Dashboard functionality
* Task creation
* Task assignment
* Task viewing
* Task status updates
* Page refresh and data persistence
* Logout and re-login
* Frontend-backend communication
* Clean installation from the GitHub repository

## 📸 Screenshots

Screenshots of the application can be added here.

### Login Page

*Add login page screenshot here.*

### Dashboard

*Add dashboard screenshot here.*

### Task Management

*Add task management screenshot here.*

### Task Status

*Add task status screenshot here.*

## 🔮 Future Improvements

Possible future enhancements include:

* Task priority levels
* Task due dates and deadlines
* Search and filtering
* Advanced role-based access control
* Email notifications
* Task analytics and charts
* Online deployment
* Improved UI animations and customization

## 👨‍💻 Author

**Sahil Maji**

B.Tech – Electronics & Communication Engineering

GitHub:
https://github.com/sahilmaji30

## 📄 License

This project is developed for educational and internship purposes.
