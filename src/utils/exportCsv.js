/**
 * Export an array of objects to a CSV file download.
 * @param {object[]} rows - flat array of objects
 * @param {string} filename - without extension
 * @param {string[]} [columns] - column keys to include; defaults to all keys
 */
export function exportToCsv(rows, filename, columns) {
  if (!rows?.length) return;
  const cols = columns || Object.keys(rows[0]);

  const escape = (v) => {
    const s = v == null ? "" : String(v).replace(/"/g, '""');
    return /[,"\n\r]/.test(s) ? `"${s}"` : s;
  };

  const header = cols.join(",");
  const body = rows
    .map((r) => cols.map((c) => escape(r[c])).join(","))
    .join("\n");

  const blob = new Blob([`\uFEFF${header}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}