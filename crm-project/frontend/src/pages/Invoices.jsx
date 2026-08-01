import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../api/axios.js";
import { LuPlus, LuPencil, LuTrash2, LuX, LuDownload, LuMail } from "react-icons/lu";

const emptyItem = () => ({ description: "", quantity: 1, price: 0 });
const emptyForm = () => ({
  contact: "",
  status: "Draft",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  taxRate: 0,
  discount: 0,
  notes: "",
  items: [emptyItem()],
});

const statusColors = {
  Draft: { bg: "#f0f1f6", color: "#6b708c" },
  Sent: { bg: "#e6f0ff", color: "#1d6fd8" },
  Paid: { bg: "#e6f7f0", color: "#16a37a" },
  Overdue: { bg: "#fdeced", color: "#e0455a" },
  Cancelled: { bg: "#f0f1f6", color: "#6b708c" },
};

const calcTotals = (form) => {
  const subtotal = form.items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
  const taxAmount = (subtotal * (Number(form.taxRate) || 0)) / 100;
  const total = Math.max(0, subtotal + taxAmount - (Number(form.discount) || 0));
  return { subtotal, taxAmount, total };
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, contactRes] = await Promise.all([api.get("/invoices"), api.get("/contacts")]);
      setInvoices(invRes.data);
      setContacts(contactRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (invoice) => {
    setEditing(invoice);
    setForm({
      contact: invoice.contact?._id || invoice.contact || "",
      status: invoice.status,
      issueDate: invoice.issueDate ? invoice.issueDate.slice(0, 10) : "",
      dueDate: invoice.dueDate ? invoice.dueDate.slice(0, 10) : "",
      taxRate: invoice.taxRate || 0,
      discount: invoice.discount || 0,
      notes: invoice.notes || "",
      items: invoice.items?.length ? invoice.items : [emptyItem()],
    });
    setShowModal(true);
  };

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, emptyItem()] });
  const removeItem = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, contact: form.contact || undefined };
    if (editing) {
      await api.put(`/invoices/${editing._id}`, payload);
    } else {
      await api.post("/invoices", payload);
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this invoice?")) return;
    await api.delete(`/invoices/${id}`);
    fetchData();
  };

  const quickStatusChange = async (invoice, status) => {
    await api.put(`/invoices/${invoice._id}`, { status });
    fetchData();
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      const res = await api.get(`/invoices/${invoice._id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF.");
    }
  };

  const [emailingId, setEmailingId] = useState(null);
  const handleEmailInvoice = async (invoice) => {
    if (!invoice.contact?.email) {
      alert("This contact doesn't have an email address on file. Add one on the Contacts page first.");
      return;
    }
    if (!confirm(`Email ${invoice.invoiceNumber} to ${invoice.contact.email}?`)) return;
    setEmailingId(invoice._id);
    try {
      await api.post(`/invoices/${invoice._id}/send-email`);
      alert(`Invoice emailed to ${invoice.contact.email}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send email. Check SMTP settings in backend/.env.");
    } finally {
      setEmailingId(null);
    }
  };

  const { subtotal, taxAmount, total } = calcTotals(form);

  return (
    <MainLayout title="Invoices">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <button className="btn btn-primary" onClick={openCreate}><LuPlus size={16} /> New Invoice</button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Contact</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-secondary)", padding: 32 }}>No invoices yet. Create your first one.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                    <td>{inv.contact?.name || "—"}</td>
                    <td>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "—"}</td>
                    <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                    <td style={{ fontWeight: 600 }}>${inv.total?.toLocaleString()}</td>
                    <td>
                      <select
                        value={inv.status}
                        onChange={(e) => quickStatusChange(inv, e.target.value)}
                        className="badge"
                        style={{
                          background: statusColors[inv.status]?.bg,
                          color: statusColors[inv.status]?.color,
                          border: "none",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {["Draft", "Sent", "Paid", "Overdue", "Cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button className="btn btn-secondary" onClick={() => handleDownloadPDF(inv)} title="Download PDF"><LuDownload size={14} /></button>
                        <button className="btn btn-secondary" onClick={() => handleEmailInvoice(inv)} disabled={emailingId === inv._id} title="Email Invoice"><LuMail size={14} /></button>
                        <button className="btn btn-secondary" onClick={() => openEdit(inv)}><LuPencil size={14} /></button>
                        <button className="btn btn-danger" onClick={() => handleDelete(inv._id)}><LuTrash2 size={14} /></button>
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
          <div className="modal" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3>{editing ? `Edit ${editing.invoiceNumber}` : "New Invoice"}</h3>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}><LuX size={14} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Contact</label>
                  <select className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}>
                    <option value="">— Select contact —</option>
                    {contacts.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ""}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {["Draft", "Sent", "Paid", "Overdue", "Cancelled"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Issue Date</label>
                  <input className="input" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Due Date</label>
                  <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>

              <label className="label">Line Items</label>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, marginBottom: 12 }}>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                    <input
                      className="input"
                      placeholder="Description"
                      style={{ flex: 3 }}
                      value={item.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                      required
                    />
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="Qty"
                      style={{ flex: 1 }}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                    />
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="Price"
                      style={{ flex: 1 }}
                      value={item.price}
                      onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                    />
                    <button type="button" className="btn btn-danger" onClick={() => removeItem(i)} disabled={form.items.length === 1}>
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addItem} style={{ marginTop: 4 }}>
                  <LuPlus size={14} /> Add Item
                </button>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Tax Rate (%)</label>
                  <input className="input" type="number" min="0" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Discount ($)</label>
                  <input className="input" type="number" min="0" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
                </div>
              </div>

              <label className="label">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ marginBottom: 16 }} />

              <div className="card" style={{ padding: 14, marginBottom: 18, background: "#fafbff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Subtotal</span><span>${subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Tax</span><span>${taxAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Discount</span><span>-${Number(form.discount || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                  <span>Total</span><span>${total.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Create Invoice"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Invoices;
