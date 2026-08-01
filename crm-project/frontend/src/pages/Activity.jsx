import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../api/axios.js";
import {
  LuPlus, LuPhone, LuMail, LuUsers, LuStickyNote, LuArrowRightLeft,
  LuListChecks, LuHandshake, LuReceipt, LuUserPlus, LuTrash2, LuX,
} from "react-icons/lu";

const typeMeta = {
  Call: { icon: LuPhone, color: "#4338ca" },
  Email: { icon: LuMail, color: "#1d6fd8" },
  Meeting: { icon: LuUsers, color: "#d98c1f" },
  Note: { icon: LuStickyNote, color: "#6b708c" },
  "Status Change": { icon: LuArrowRightLeft, color: "#16a37a" },
  Task: { icon: LuListChecks, color: "#e0455a" },
  Deal: { icon: LuHandshake, color: "#4338ca" },
  Invoice: { icon: LuReceipt, color: "#0f8f65" },
  Contact: { icon: LuUserPlus, color: "#7c6cf5" },
};

const emptyForm = { type: "Note", title: "", description: "", contact: "" };

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async (type = "") => {
    setLoading(true);
    try {
      const [actRes, contactRes] = await Promise.all([
        api.get("/activities", { params: type ? { type } : {} }),
        api.get("/contacts"),
      ]);
      setActivities(actRes.data);
      setContacts(contactRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (type) => {
    setFilterType(type);
    fetchData(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/activities", { ...form, contact: form.contact || undefined });
    setShowModal(false);
    setForm(emptyForm);
    fetchData(filterType);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this activity?")) return;
    await api.delete(`/activities/${id}`);
    fetchData(filterType);
  };

  const filterOptions = ["", "Call", "Email", "Meeting", "Note", "Status Change", "Task", "Deal", "Invoice", "Contact"];

  return (
    <MainLayout title="Activity Log">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filterOptions.map((t) => (
            <button
              key={t || "all"}
              onClick={() => handleFilter(t)}
              className={`btn ${filterType === t ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "6px 12px", fontSize: 13 }}
            >
              {t || "All"}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><LuPlus size={16} /> Log Activity</button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card" style={{ padding: 24 }}>
          {activities.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: 20 }}>
              No activity yet. Actions like creating contacts, leads, or deals will show up here automatically.
            </p>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 19, top: 8, bottom: 8, width: 2, background: "var(--border)" }} />
              {activities.map((a) => {
                const meta = typeMeta[a.type] || typeMeta.Note;
                const Icon = meta.icon;
                return (
                  <div key={a._id} style={{ display: "flex", gap: 16, marginBottom: 22, position: "relative" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: meta.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        zIndex: 1,
                      }}
                    >
                      <Icon size={18} color="#fff" />
                    </div>
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span className="badge" style={{ background: "#f0f1f6", color: meta.color, marginRight: 8 }}>{a.type}</span>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</span>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: "4px 8px" }} onClick={() => handleDelete(a._id)}>
                          <LuTrash2 size={12} />
                        </button>
                      </div>
                      {a.description && <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0" }}>{a.description}</p>}
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                        {a.contact?.name && <span>{a.contact.name} · </span>}
                        {a.lead?.title && <span>{a.lead.title} · </span>}
                        {a.deal?.title && <span>{a.deal.title} · </span>}
                        {timeAgo(a.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3>Log Activity</h3>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}><LuX size={14} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ marginBottom: 12 }}>
                {["Call", "Email", "Meeting", "Note"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <label className="label">Title</label>
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Called to discuss renewal" style={{ marginBottom: 12 }} />
              <label className="label">Related Contact (optional)</label>
              <select className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} style={{ marginBottom: 12 }}>
                <option value="">— None —</option>
                {contacts.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 18 }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Activity;
