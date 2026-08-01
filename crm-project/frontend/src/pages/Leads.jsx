import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../api/axios.js";
import { LuPlus, LuPencil, LuTrash2, LuSparkles, LuDownload } from "react-icons/lu";
import { exportToCSV } from "../utils/exportCsv.js";

const emptyForm = { title: "", source: "Website", status: "New", value: 0, description: "" };

const statusColors = {
  New: { bg: "#eef0ff", color: "#4338ca" },
  Contacted: { bg: "#fff4e0", color: "#d98c1f" },
  Qualified: { bg: "#e6f7f0", color: "#16a37a" },
  Lost: { bg: "#fdeced", color: "#e0455a" },
  Converted: { bg: "#e6f7f0", color: "#0f8f65" },
};

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [scoringId, setScoringId] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leads");
      setLeads(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (lead) => {
    setEditing(lead);
    setForm({
      title: lead.title,
      source: lead.source,
      status: lead.status,
      value: lead.value,
      description: lead.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/leads/${editing._id}`, form);
    } else {
      await api.post("/leads", form);
    }
    setShowModal(false);
    fetchLeads();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this lead?")) return;
    await api.delete(`/leads/${id}`);
    fetchLeads();
  };

  const handleExport = () => {
    exportToCSV(
      leads,
      [
        { key: "title", label: "Title" },
        { key: "source", label: "Source" },
        { key: "status", label: "Status" },
        { key: "value", label: "Value" },
        { key: "aiScore", label: "AI Score" },
        { value: (l) => l.contact?.name || "", label: "Contact" },
        { key: "description", label: "Description" },
      ],
      "leads.csv"
    );
  };

  const handleScore = async (id) => {
    setScoringId(id);
    try {
      await api.post(`/ai/score-lead/${id}`);
      fetchLeads();
    } catch (err) {
      alert("AI scoring failed. Check your OpenAI API key.");
    } finally {
      setScoringId(null);
    }
  };

  return (
    <MainLayout title="Leads">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18, gap: 8 }}>
        <button className="btn btn-secondary" onClick={handleExport}><LuDownload size={16} /> Export CSV</button>
        <button className="btn btn-primary" onClick={openCreate}><LuPlus size={16} /> Add Lead</button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Source</th>
                <th>Status</th>
                <th>Value</th>
                <th>AI Score</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)", padding: 32 }}>No leads yet. Add your first one.</td></tr>
              ) : (
                leads.map((l) => (
                  <tr key={l._id}>
                    <td style={{ fontWeight: 600 }}>{l.title}</td>
                    <td>{l.source}</td>
                    <td>
                      <span className="badge" style={{ background: statusColors[l.status]?.bg, color: statusColors[l.status]?.color }}>
                        {l.status}
                      </span>
                    </td>
                    <td>${l.value?.toLocaleString()}</td>
                    <td>
                      {l.aiScore != null ? (
                        <span title={l.aiSummary} style={{ fontWeight: 700, color: l.aiScore >= 70 ? "var(--accent)" : l.aiScore >= 40 ? "var(--warning)" : "var(--danger)" }}>
                          {l.aiScore}/100
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-secondary)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button className="btn btn-secondary" onClick={() => handleScore(l._id)} disabled={scoringId === l._id} title="AI Score">
                          <LuSparkles size={14} /> {scoringId === l._id ? "..." : ""}
                        </button>
                        <button className="btn btn-secondary" onClick={() => openEdit(l)}><LuPencil size={14} /></button>
                        <button className="btn btn-danger" onClick={() => handleDelete(l._id)}><LuTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>{editing ? "Edit Lead" : "Add Lead"}</h3>
            <form onSubmit={handleSubmit}>
              <label className="label">Title</label>
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Source</label>
              <input className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ marginBottom: 12 }}>
                {["New", "Contacted", "Qualified", "Lost", "Converted"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <label className="label">Value ($)</label>
              <input className="input" type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} style={{ marginBottom: 12 }} />
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 18 }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Create Lead"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Leads;
