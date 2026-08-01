import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../api/axios.js";
import { LuPlus, LuPencil, LuTrash2, LuSearch, LuSparkles, LuX, LuDownload } from "react-icons/lu";
import { exportToCSV } from "../utils/exportCsv.js";

const emptyForm = { name: "", email: "", phone: "", company: "", jobTitle: "", notes: "" };

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [summary, setSummary] = useState({ open: false, text: "", loading: false, contact: null });

  const fetchContacts = async (q = "") => {
    setLoading(true);
    try {
      const res = await api.get("/contacts", { params: q ? { search: q } : {} });
      setContacts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchContacts(search);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (contact) => {
    setEditing(contact);
    setForm({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      jobTitle: contact.jobTitle || "",
      notes: contact.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/contacts/${editing._id}`, form);
    } else {
      await api.post("/contacts", form);
    }
    setShowModal(false);
    fetchContacts(search);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this contact?")) return;
    await api.delete(`/contacts/${id}`);
    fetchContacts(search);
  };

  const handleExport = () => {
    exportToCSV(
      contacts,
      [
        { key: "name", label: "Name" },
        { key: "company", label: "Company" },
        { key: "jobTitle", label: "Job Title" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "notes", label: "Notes" },
      ],
      "contacts.csv"
    );
  };

  const handleSummarize = async (contact) => {
    setSummary({ open: true, text: "", loading: true, contact });
    try {
      const res = await api.post(`/ai/summarize-contact/${contact._id}`);
      setSummary({ open: true, text: res.data.summary, loading: false, contact });
    } catch (err) {
      setSummary({ open: true, text: "Failed to generate summary. Check your OpenAI API key.", loading: false, contact });
    }
  };

  return (
    <MainLayout title="Contacts">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, flex: 1, maxWidth: 360 }}>
          <input
            className="input"
            placeholder="Search by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-secondary" type="submit"><LuSearch size={16} /></button>
        </form>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleExport}><LuDownload size={16} /> Export CSV</button>
          <button className="btn btn-primary" onClick={openCreate}><LuPlus size={16} /> Add Contact</button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)", padding: 32 }}>No contacts yet. Add your first one.</td></tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.company || "—"}</td>
                    <td>{c.email || "—"}</td>
                    <td>{c.phone || "—"}</td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button className="btn btn-secondary" onClick={() => handleSummarize(c)} title="AI Summarize"><LuSparkles size={14} /></button>
                        <button className="btn btn-secondary" onClick={() => openEdit(c)}><LuPencil size={14} /></button>
                        <button className="btn btn-danger" onClick={() => handleDelete(c._id)}><LuTrash2 size={14} /></button>
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
            <h3 style={{ marginBottom: 16 }}>{editing ? "Edit Contact" : "Add Contact"}</h3>
            <form onSubmit={handleSubmit}>
              <label className="label">Name</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Job Title</label>
              <input className="input" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="label">Notes</label>
              <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ marginBottom: 18 }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Create Contact"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {summary.open && (
        <div className="modal-backdrop" onClick={() => setSummary({ ...summary, open: false })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3><LuSparkles size={16} style={{ marginRight: 6, verticalAlign: -2 }} />AI Summary — {summary.contact?.name}</h3>
              <button className="btn btn-secondary" onClick={() => setSummary({ ...summary, open: false })}><LuX size={14} /></button>
            </div>
            {summary.loading ? <Loader label="Generating summary..." /> : (
              <p style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{summary.text}</p>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Contacts;
