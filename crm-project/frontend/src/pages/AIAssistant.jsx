import { useState, useRef, useEffect } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import api from "../api/axios.js";
import { LuSend, LuSparkles, LuMail } from "react-icons/lu";

const AIAssistant = () => {
  const [tab, setTab] = useState("chat");

  // Chat state
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your CRM AI assistant. Ask me to draft emails, summarize notes, or give sales advice." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  // Email generator state
  const [emailForm, setEmailForm] = useState({ contactName: "", context: "", tone: "professional" });
  const [emailResult, setEmailResult] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setSending(true);
    try {
      const history = newMessages.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const res = await api.post("/ai/chat", { message: input, history: history.slice(0, -1) });
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please check your OpenAI API key in the backend .env file." }]);
    } finally {
      setSending(false);
    }
  };

  const generateEmail = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailResult("");
    try {
      const res = await api.post("/ai/generate-email", emailForm);
      setEmailResult(res.data.email);
    } catch (err) {
      setEmailResult("Failed to generate email. Check your OpenAI API key.");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <MainLayout title="AI Assistant">
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className={`btn ${tab === "chat" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("chat")}>
          <LuSparkles size={16} /> Chat Assistant
        </button>
        <button className={`btn ${tab === "email" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("email")}>
          <LuMail size={16} /> Email Generator
        </button>
      </div>

      {tab === "chat" ? (
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "70vh" }}>
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: m.role === "user" ? "var(--brand)" : "#f0f1f6",
                    color: m.role === "user" ? "#fff" : "var(--text-primary)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "10px 14px", borderRadius: 12, background: "#f0f1f6", fontSize: 14, color: "var(--text-secondary)" }}>
                  Thinking...
                </div>
              </div>
            )}
          </div>
          <form onSubmit={sendMessage} style={{ display: "flex", gap: 10, padding: 16, borderTop: "1px solid var(--border)" }}>
            <input
              className="input"
              placeholder="Ask something about your leads, deals, or draft an email..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={sending}><LuSend size={16} /></button>
          </form>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div className="card" style={{ flex: 1, minWidth: 320, padding: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>Generate Follow-up Email</h3>
            <form onSubmit={generateEmail}>
              <label className="label">Contact Name</label>
              <input className="input" value={emailForm.contactName} onChange={(e) => setEmailForm({ ...emailForm, contactName: e.target.value })} placeholder="e.g. Rohan Sharma" style={{ marginBottom: 12 }} />
              <label className="label">Context</label>
              <textarea className="input" rows={4} value={emailForm.context} onChange={(e) => setEmailForm({ ...emailForm, context: e.target.value })} placeholder="e.g. They showed interest in our premium plan last week." style={{ marginBottom: 12 }} />
              <label className="label">Tone</label>
              <select className="input" value={emailForm.tone} onChange={(e) => setEmailForm({ ...emailForm, tone: e.target.value })} style={{ marginBottom: 18 }}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="persuasive">Persuasive</option>
                <option value="formal">Formal</option>
              </select>
              <button className="btn btn-primary" type="submit" disabled={emailLoading} style={{ width: "100%", justifyContent: "center" }}>
                {emailLoading ? "Generating..." : "Generate Email"}
              </button>
            </form>
          </div>

          <div className="card" style={{ flex: 1, minWidth: 320, padding: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>Result</h3>
            {emailResult ? (
              <p style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{emailResult}</p>
            ) : (
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Your generated email will appear here.</p>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AIAssistant;
