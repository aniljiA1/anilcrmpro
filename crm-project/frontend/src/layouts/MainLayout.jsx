import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";

const MainLayout = ({ title, children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Navbar title={title} />
        <main style={{ padding: 28 }}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
