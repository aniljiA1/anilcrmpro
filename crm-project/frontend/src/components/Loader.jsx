const Loader = ({ label = "Loading..." }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        flexDirection: "column",
        gap: 12,
        color: "var(--text-secondary)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "3px solid var(--brand-light)",
          borderTopColor: "var(--brand)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span>{label}</span>
    </div>
  );
};

export default Loader;
