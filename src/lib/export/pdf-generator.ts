import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCents } from "@/lib/money/currency";

export interface DisputePdfData {
  workspaceName: string;
  providerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalBilledCents: number;
  potentialDiscrepancyCents: number;
  confirmedDiscrepancyCents: number;
  flags: Array<{
    lineNumber: number;
    reference: string;
    category: string;
    expectedRateCents: number | null;
    billedTotalCents: number;
    differenceCents: number;
    ruleTitle: string;
    status: string;
    notes?: string;
  }>;
}

export function generateDisputePdf(data: DisputePdfData): Uint8Array {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header Bar
  doc.setFillColor(30, 58, 138); // Dark blue #1e3a8a
  doc.rect(0, 0, 210, 26, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("3PL WAREHOUSE INVOICE DISPUTE CLAIM", 14, 16);

  // Subtitle / Meta
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  let y = 36;
  doc.text(`Brand / Workspace: ${data.workspaceName}`, 14, y);
  doc.text(`Date of Audit: ${new Date().toLocaleDateString()}`, 130, y);
  
  y += 6;
  doc.text(`3PL Warehouse Provider: ${data.providerName}`, 14, y);
  doc.text(`Invoice Number: ${data.invoiceNumber}`, 130, y);

  y += 6;
  doc.text(`Invoice Date: ${data.invoiceDate}`, 14, y);

  // Summary Metrics Box
  y += 10;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(14, y, 182, 24, 2, 2, "F");

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL BILLED INVOICE", 20, y + 8);
  doc.text("POTENTIAL DISCREPANCIES", 80, y + 8);
  doc.text("CONFIRMED OVERCHARGES", 145, y + 8);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(formatCents(data.totalBilledCents), 20, y + 18);

  doc.setTextColor(217, 119, 6); // Amber
  doc.text(formatCents(data.potentialDiscrepancyCents), 80, y + 18);

  doc.setTextColor(220, 38, 38); // Red
  doc.text(formatCents(data.confirmedDiscrepancyCents), 145, y + 18);

  // Notice boundary
  y += 32;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Notice: Discrepancies listed below reflect variance against current signed rate card schedules. Items marked 'Awaiting Clarification' require rate or line justification from warehouse billing operations.",
    14,
    y,
    { maxWidth: 182 }
  );

  // Table of flags
  const tableData = data.flags.map((flag) => [
    `#${flag.lineNumber}\n${flag.reference || "-"}`,
    flag.category,
    flag.ruleTitle,
    formatCents(flag.billedTotalCents),
    formatCents(flag.expectedRateCents),
    formatCents(flag.differenceCents),
    flag.status.replace("_", " "),
    flag.notes || "-",
  ]);

  autoTable(doc, {
    startY: y + 8,
    head: [
      [
        "Line / Ref",
        "Category",
        "Audit Rule",
        "Billed",
        "Contracted",
        "Variance",
        "Status",
        "Notes",
      ],
    ],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 26 },
      2: { cellWidth: 34 },
      3: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 18, halign: "right" },
      5: { cellWidth: 18, halign: "right", fontStyle: "bold" },
      6: { cellWidth: 22, halign: "center" },
      7: { cellWidth: 24 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      `3PL Invoice Auditor Dispute Report • Page ${i} of ${totalPages} • Strictly Confidential`,
      14,
      287
    );
  }

  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}
