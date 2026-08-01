import { useAuth } from "../context/AuthContext.jsx";
import { LuLogOut } from "react-icons/lu";

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        borderBottom: "1px solid var(--border)",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <h2 style={{ fontSize: 20 }}>{title}</h2>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{user?.role}</div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--brand-light)",
            color: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <button className="btn btn-secondary" onClick={logout} title="Logout">
          <LuLogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
