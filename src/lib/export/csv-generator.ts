import { formatCents } from "@/lib/money/currency";

export interface CsvExportRow {
  invoiceNumber: string;
  lineNumber: number;
  orderReference: string;
  category: string;
  description: string;
  carrier?: string;
  weight?: string;
  customFields?: string;
  status: string;
  ruleType: string;
  expectedRateCents: number | null;
  expectedTotalCents: number | null;
  billedTotalCents: number;
  differenceCents: number;
  userNote: string;
  calculationBreakdown: string;
}

export function generateAuditCsv(rows: CsvExportRow[]): string {
  const headers = [
    "Invoice Number",
    "Line #",
    "Order Reference",
    "Category",
    "Description",
    "Carrier",
    "Billed Weight",
    "Custom Attributes",
    "Audit Status",
    "Rule Triggered",
    "Contracted Rate",
    "Expected Total",
    "Billed Total",
    "Potential Discrepancy",
    "Internal Note",
    "Calculation Breakdown",
  ];

  const escapeCsv = (str: string | number | null | undefined): string => {
    if (str === null || str === undefined) return '""';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  };

  const lines = [headers.join(",")];

  for (const row of rows) {
    const line = [
      escapeCsv(row.invoiceNumber),
      row.lineNumber,
      escapeCsv(row.orderReference),
      escapeCsv(row.category),
      escapeCsv(row.description),
      escapeCsv(row.carrier || ""),
      escapeCsv(row.weight || ""),
      escapeCsv(row.customFields || ""),
      escapeCsv(row.status),
      escapeCsv(row.ruleType),
      escapeCsv(formatCents(row.expectedRateCents)),
      escapeCsv(formatCents(row.expectedTotalCents)),
      escapeCsv(formatCents(row.billedTotalCents)),
      escapeCsv(formatCents(row.differenceCents)),
      escapeCsv(row.userNote || ""),
      escapeCsv(row.calculationBreakdown),
    ];
    lines.push(line.join(","));
  }

  return lines.join("\n");
}
