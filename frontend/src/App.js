import { useEffect, useState } from "react";
import API from "./api";
import Auth from "./Auth";
import "./App.css";

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Pending"
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (isAuth) fetchTasks();
  }, [isAuth]);

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTask = async () => {
    await API.post("/tasks", form);
    setForm({ title: "", description: "", status: "Pending" });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const startEdit = (task) => {
    setForm(task);
    setEditId(task._id);
    setActiveTab("tasks");
  };

  const updateTask = async () => {
    await API.put(`/tasks/${editId}`, form);
    setEditId(null);
    setForm({ title: "", description: "", status: "Pending" });
    fetchTasks();
  };

  if (!isAuth) return <Auth setIsAuth={setIsAuth} />;

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>Task Panel</h2>

        <p onClick={() => setActiveTab("dashboard")}>Dashboard</p>
        <p onClick={() => setActiveTab("tasks")}>Tasks</p>
        <p onClick={() => setActiveTab("reports")}>Reports</p>

        <button onClick={() => {
          localStorage.removeItem("token");
          window.location.reload();
        }}>
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* TOP BAR */}
        <div className="topbar">
          <h3>Welcome</h3>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="stats">
            <div className="card">
              <h3>Total Tasks</h3>
              <p>{tasks.length}</p>
            </div>

            <div className="card">
              <h3>Completed</h3>
              <p>{tasks.filter(t => t.status === "Completed").length}</p>
            </div>

            <div className="card">
              <h3>Pending</h3>
              <p>{tasks.filter(t => t.status === "Pending").length}</p>
            </div>
          </div>
        )}

        {/* TASKS */}
        {activeTab === "tasks" && (
          <>
            <div className="form-card">
              <h2>{editId ? "Update Task" : "Add Task"}</h2>

              <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
              <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />

              <select name="status" value={form.status} onChange={handleChange}>
                <option>Pending</option>
                <option>Completed</option>
              </select>

              {editId ? (
                <button onClick={updateTask}>Update</button>
              ) : (
                <button onClick={addTask}>Add Task</button>
              )}
            </div>

            <div className="grid">
              {tasks.map((t) => (
                <div key={t._id} className="card">
                  <h3>{t.title}</h3>
                  <p>{t.description}</p>

                  <span className={`status ${t.status}`}>
                    {t.status}
                  </span>

                  <div className="btns">
                    <button onClick={() => startEdit(t)}>Edit</button>
                    <button onClick={() => deleteTask(t._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* REPORTS */}
        {activeTab === "reports" && (
          <div className="card">
            <h2>Reports</h2>
            <p>Total Tasks: {tasks.length}</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;