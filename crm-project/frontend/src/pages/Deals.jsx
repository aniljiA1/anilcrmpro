import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../api/axios.js";
import { LuPlus, LuPencil, LuTrash2, LuDownload } from "react-icons/lu";
import { exportToCSV } from "../utils/exportCsv.js";

const emptyForm = { title: "", stage: "Prospecting", amount: 0, closeDate: "", notes: "" };

const stageColors = {
  Prospecting: { bg: "#eef0ff", color: "#4338ca" },
  Proposal: { bg: "#fff4e0", color: "#d98c1f" },
  Negotiation: { bg: "#e6f0ff", color: "#1d6fd8" },
  Won: { bg: "#e6f7f0", color: "#16a37a" },
  Lost: { bg: "#fdeced", color: "#e0455a" },
};

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/deals");
      setDeals(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (deal) => {
    setEditing(deal);
    setForm({
      title: deal.title,
      stage: deal.stage,
      amount: deal.amount,
      closeDate: deal.closeDate ? deal.closeDate.slice(0, 10) : "",
      notes: deal.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/deals/${editing._id}`, form);
    } else {
      await api.post("/deals", form);
    }
    setShowModal(false);
    fetchDeals();
  };

  const handleExport = () => {
    exportToCSV(
      deals,
      [
        { key: "title", label: "Title" },
        { key: "stage", label: "Stage" },
        { key: "amount", label: "Amount" },
        { value: (d) => d.contact?.name || "", label: "Contact" },
        { value: (d) => (d.closeDate ? new Date(d.closeDate).toLocaleDateString() : ""), label: "Close Date" },
        { key: "notes", label: "Notes" },
      ],
      "deals.csv"
    );
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this deal?")) return;
    await api.delete(`/deals/${id}`);
    fetchDeals();
  };

  return (
    <MainLayout title="Deals">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18, gap: 8 }}>
        <button className="btn btn-secondary" onClick={handleExport}><LuDownload size={16} /> Export CSV</button>
        <button className="btn btn-primary" onClick={openCreate}><LuPlus size={16} /> Add Deal</button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Stage</th>
                <th>Amount</th>
                <th>Close Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)", padding: 32 }}>No deals yet. Add your first one.</td></tr>
              ) : (
                deals.map((d) => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600 }}>{d.title}</td>
                    <td>
                      <span className="badge" style={{ background: stageColors[d.stage]?.bg, color: stageColors[d.stage]?.color }}>
                        {d.stage}
                      </span>
                    </td>
                    <td>${d.amount?.toLocaleString()}</td>
                    <td>{d.closeDate ? new Date(d.closeDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button className="btn btn-secondary" onClick={() => openEdit(d)}><LuPencil size={14} /></button>
                        <button className="btn btn-danger" onClick={() => handleDelete(d._id)}><LuTrash2 size={14} /></button>
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
            <h3 style={{ marginBottom: 16 }}>{editing ? "Edit Deal" : "Add Deal"}</h3>
            <form onSubmit={handleSubmit}>
              <label className="label">Title</label>
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Stage</label>
              <select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} style={{ marginBottom: 12 }}>
                {["Prospecting", "Proposal", "Negotiation", "Won", "Lost"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <label className="label">Amount ($)</label>
              <input className="input" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} style={{ marginBottom: 12 }} />
              <label className="label">Expected Close Date</label>
              <input className="input" type="date" value={form.closeDate} onChange={(e) => setForm({ ...form, closeDate: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Notes</label>
              <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ marginBottom: 18 }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Create Deal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Deals;
