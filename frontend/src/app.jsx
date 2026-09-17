import React, { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { api } from "./api";

// ==================== PROTECTED ROUTE ====================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" />;
}

// ==================== NAVBAR ====================

function Navbar() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">ETMS</div>

      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/my-tasks">My Tasks</Link>
        <Link to="/create-task">Create Task</Link>
      </div>

      <div className="nav-user">
        <span>{name}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

// ==================== LOGIN ====================

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await api.login({
        email,
        password,
      });

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("name", data.name);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user_id", data.user_id);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>ETMS</h1>
        <h2>Login</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

// ==================== REGISTER ====================

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.register(form);

      alert("Registration successful. Please login.");

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>ETMS</h1>
        <h2>Register</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleRegister}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>

          <button type="submit">Register</button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

// ==================== DASHBOARD ====================

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <Page>
        <div className="error">{error}</div>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page>
        <h2>Loading dashboard...</h2>
      </Page>
    );
  }

  return (
    <Page>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Employee Task Management System</p>
        </div>

        <Link className="button" to="/create-task">
          + Create Task
        </Link>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Total Users</h3>
          <strong>{data.total_users}</strong>
        </div>

        <div className="card">
          <h3>Total Tasks</h3>
          <strong>{data.total_tasks}</strong>
        </div>

        <div className="card">
          <h3>Pending</h3>
          <strong>{data.pending_tasks}</strong>
        </div>

        <div className="card">
          <h3>In Progress</h3>
          <strong>{data.in_progress_tasks}</strong>
        </div>

        <div className="card">
          <h3>Completed</h3>
          <strong>{data.completed_tasks}</strong>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Quick Actions</h2>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <Link className="button" to="/tasks">
            View All Tasks
          </Link>

          <Link className="button" to="/my-tasks">
            View My Tasks
          </Link>

          <Link className="button" to="/create-task">
            Create New Task
          </Link>
        </div>
      </div>
    </Page>
  );
}

// ==================== TASKS ====================

function Tasks({ mine = false }) {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      const data = mine
        ? await api.getMyTasks()
        : await api.getTasks();

      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [mine]);

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    try {
      await api.deleteTask(id);
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Page>
      <div className="page-header">
        <h1>{mine ? "My Tasks" : "All Tasks"}</h1>

        {!mine && (
          <Link className="button" to="/create-task">
            + Create Task
          </Link>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {tasks.length === 0 ? (
        <div className="empty">
          No tasks found.
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div className="task-card" key={task.id}>
              <div>
                <h2>{task.title}</h2>

                <p>
                  {task.description || "No description"}
                </p>

                <div className="task-info">
                  <span>
                    Status: <b>{task.status}</b>
                  </span>

                  <span>
                    Priority: <b>{task.priority}</b>
                  </span>

                  <span>
                    Assigned To:{" "}
                    <b>{task.assigned_to ?? "Unassigned"}</b>
                  </span>
                </div>
              </div>

              <div className="task-actions">
                <Link to={`/edit-task/${task.id}`}>
                  Edit
                </Link>

                <button
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

// ==================== CREATE TASK ====================

function CreateTask() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assigned_to: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = {
        title: form.title,
        description: form.description,
        priority: form.priority,
      };

      if (form.assigned_to !== "") {
        data.assigned_to = Number(form.assigned_to);
      }

      await api.createTask(data);

      alert("Task created successfully!");

      navigate("/tasks");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Page>
      <div className="form-box">
        <h1>Create Task</h1>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Title</label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
          />

          <label>Priority</label>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label>Assign To (User ID - optional)</label>

          <input
            name="assigned_to"
            type="number"
            min="1"
            value={form.assigned_to}
            onChange={handleChange}
            placeholder="Example: 1"
          />

          <button type="submit">
            Create Task
          </button>
        </form>
      </div>
    </Page>
  );
}

// ==================== EDIT TASK ====================

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Pending",
    priority: "Medium",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    api.getTask(id)
      .then((task) => {
        setForm({
          title: task.title || "",
          description: task.description || "",
          status: task.status || "Pending",
          priority: task.priority || "Medium",
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.updateTask(id, form);

      alert("Task updated successfully!");

      navigate("/tasks");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Page>
      <div className="form-box">
        <h1>Edit Task</h1>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Title</label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
          />

          <label>Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <label>Priority</label>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <button type="submit">
            Update Task
          </button>
        </form>
      </div>
    </Page>
  );
}

// ==================== PAGE WRAPPER ====================

function Page({ children }) {
  return (
    <>
      <Navbar />
      <main className="container">
        {children}
      </main>
    </>
  );
}

// ==================== APP ====================

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-tasks"
        element={
          <ProtectedRoute>
            <Tasks mine />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-task"
        element={
          <ProtectedRoute>
            <CreateTask />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-task/:id"
        element={
          <ProtectedRoute>
            <EditTask />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to="/dashboard" />}
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" />}
      />
    </Routes>
  );
}

export default App;