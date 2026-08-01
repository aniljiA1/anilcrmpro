import { NavLink } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuUsers,
  LuTarget,
  LuHandshake,
  LuListChecks,
  LuSparkles,
  LuReceipt,
  LuActivity,
} from "react-icons/lu";

const links = [
  { to: "/", label: "Dashboard", icon: LuLayoutDashboard, end: true },
  { to: "/contacts", label: "Contacts", icon: LuUsers },
  { to: "/leads", label: "Leads", icon: LuTarget },
  { to: "/deals", label: "Deals", icon: LuHandshake },
  { to: "/invoices", label: "Invoices", icon: LuReceipt },
  { to: "/tasks", label: "Tasks", icon: LuListChecks },
  { to: "/activity", label: "Activity Log", icon: LuActivity },
  { to: "/ai-assistant", label: "AI Assistant", icon: LuSparkles },
];

const Sidebar = () => {
  return (
    <aside
      style={{
        width: 240,
        background: "#14162b",
        color: "#fff",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px 28px" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "linear-gradient(135deg,#4338ca,#7c6cf5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontFamily: "Sora",
          }}
        >
          C
        </div>
        <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 18 }}>CRM Pro</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: isActive ? "#fff" : "#a2a5c4",
              background: isActive ? "rgba(124,108,245,0.25)" : "transparent",
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: "auto", fontSize: 12, color: "#6b708c", padding: "10px" }}>
        Powered by OpenAI ✨
      </div>
    </aside>
  );
};

export default Sidebar;
