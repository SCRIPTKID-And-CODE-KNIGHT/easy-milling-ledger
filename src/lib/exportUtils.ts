import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ExportRow = Record<string, string | number>;

export function exportToCSV(filename: string, headers: string[], rows: ExportRow[], keys: string[]) {
  const csvHeader = headers.join(",");
  const csvRows = rows.map((r) => keys.map((k) => `"${r[k] ?? ""}"`).join(","));
  const csv = [csvHeader, ...csvRows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToPDF(title: string, filename: string, headers: string[], rows: ExportRow[], keys: string[]) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 18);
  
  autoTable(doc, {
    startY: 25,
    head: [headers],
    body: rows.map((r) => keys.map((k) => String(r[k] ?? ""))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 98, 180] },
  });
  
  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
