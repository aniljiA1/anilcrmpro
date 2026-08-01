// Converts an array of flat objects into a downloadable CSV file.
// columns: [{ key: "name", label: "Name" }, ...]
export const exportToCSV = (data, columns, filename = "export.csv") => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const escapeCell = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const rows = data.map((row) =>
    columns.map((c) => escapeCell(typeof c.value === "function" ? c.value(row) : row[c.key])).join(",")
  );

  const csvContent = [header, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
