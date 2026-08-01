import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import MainLayout from "../layouts/MainLayout.jsx";
import Loader from "../components/Loader.jsx";
import api from "../api/axios.js";
import { LuUsers, LuTarget, LuHandshake, LuListChecks, LuReceipt } from "react-icons/lu";

const COLORS = ["#4338ca", "#7c6cf5", "#16a37a", "#d98c1f", "#e0455a"];

const StatCard = ({ icon: Icon, label, value, tint }) => (
  <div className="card" style={{ padding: 20, flex: 1 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: tint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={20} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Sora" }}>{value}</div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MainLayout title="Dashboard"><Loader /></MainLayout>;

  const leadsPieData = (stats.leadsByStatus || []).map((s) => ({ name: s._id, value: s.count }));
  const dealsBarData = Object.entries(stats.dealsByStage || {}).map(([stage, count]) => ({ stage, count }));

  return (
    <MainLayout title="Dashboard">
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon={LuUsers} label="Total Contacts" value={stats.totalContacts} tint="#4338ca" />
        <StatCard icon={LuTarget} label="Total Leads" value={stats.totalLeads} tint="#16a37a" />
        <StatCard icon={LuHandshake} label="Active Deals" value={stats.totalDeals} tint="#d98c1f" />
        <StatCard icon={LuListChecks} label="Open Tasks" value={stats.openTasks} tint="#e0455a" />
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: 220, padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Pipeline Value</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Sora", color: "var(--brand)" }}>
            ${stats.pipelineValue?.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 220, padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Won Value</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Sora", color: "var(--accent)" }}>
            ${stats.wonValue?.toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 220, padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Outstanding Invoices</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Sora", color: "var(--warning)" }}>
            ${stats.outstanding?.toLocaleString() || 0}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 220, padding: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Invoiced</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Sora", color: "var(--brand)" }}>
            ${stats.totalInvoiced?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: 320, padding: 20, height: 320 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Leads by Status</h3>
          {leadsPieData.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No leads yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={leadsPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {leadsPieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{ flex: 1, minWidth: 320, padding: 20, height: 320 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Deals by Stage</h3>
          {dealsBarData.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No deals yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={dealsBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4338ca" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
