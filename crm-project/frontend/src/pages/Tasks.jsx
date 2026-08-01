import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../api/axios.js";
import { LuPlus, LuTrash2, LuCheck } from "react-icons/lu";

const emptyForm = { title: "", description: "", dueDate: "", priority: "Medium" };

const priorityColors = {
  Low: { bg: "#e6f7f0", color: "#16a37a" },
  Medium: { bg: "#fff4e0", color: "#d98c1f" },
  High: { bg: "#fdeced", color: "#e0455a" },
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/tasks", form);
    setShowModal(false);
    setForm(emptyForm);
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    await api.put(`/tasks/${task._id}`, { completed: !task.completed });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  return (
    <MainLayout title="Tasks">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><LuPlus size={16} /> Add Task</button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>No tasks yet. Add your first one.</div>
          ) : (
            tasks.map((t) => (
              <div key={t._id} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, opacity: t.completed ? 0.6 : 1 }}>
                <button
                  onClick={() => toggleComplete(t)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: `2px solid ${t.completed ? "var(--accent)" : "var(--border)"}`,
                    background: t.completed ? "var(--accent)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {t.completed && <LuCheck size={14} color="#fff" />}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</div>
                  {t.description && <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.description}</div>}
                </div>
                {t.dueDate && (
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {new Date(t.dueDate).toLocaleDateString()}
                  </div>
                )}
                <span className="badge" style={{ background: priorityColors[t.priority]?.bg, color: priorityColors[t.priority]?.color }}>
                  {t.priority}
                </span>
                <button className="btn btn-danger" onClick={() => handleDelete(t._id)}><LuTrash2 size={14} /></button>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Add Task</h3>
            <form onSubmit={handleSubmit}>
              <label className="label">Title</label>
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Description</label>
              <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Due Date</label>
              <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={{ marginBottom: 18 }}>
                {["Low", "Medium", "High"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Tasks;
