import { useRef } from "react";
import Layout from "../components/Layout";
import { useGetReadings, useGetRooms } from "@workspace/api-client-react/src/generated/api";
import { useUserTier } from "../context/UserTierContext";
import LockedFeature from "../components/LockedFeature";
import { FileText, Download, Filter, Shield } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Compliance() {
  const { tier, config } = useUserTier();
  const { data: readings, isLoading } = useGetReadings({ limit: 500 });
  const { data: rooms } = useGetRooms();
  const tableRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    const jsPDFModule = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    const jsPDF = jsPDFModule.default;

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(18);
    doc.setTextColor(30, 80, 60);
    doc.text("Pure Air Guard – Humidity Compliance Report", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${format(new Date(), "dd MMM yyyy HH:mm")}`, 14, 28);
    doc.text(`Total Records: ${readings?.length || 0}`, 14, 34);

    const rows = (readings || []).map(r => [
      format(new Date(r.recordedAt), "dd/MM/yyyy"),
      format(new Date(r.recordedAt), "HH:mm:ss"),
      r.humidity.toFixed(1) + "%",
      r.temperature.toFixed(1) + "°C",
      r.roomName || "-",
      r.source,
      r.mouldRiskScore > 70 ? "HIGH" : r.mouldRiskScore > 40 ? "MEDIUM" : "LOW",
    ]);

    (autoTableModule.default as any)(doc, {
      head: [["Date", "Time", "Humidity", "Temperature", "Location", "Source", "Risk"]],
      body: rows,
      startY: 42,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 120, 80], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 252, 246] },
      columnStyles: {
        6: {
          cellWidth: 20,
          fontStyle: "bold",
        }
      },
      didParseCell: (data: any) => {
        if (data.column.index === 6 && data.section === "body") {
          const val = data.cell.text[0];
          if (val === "HIGH") data.cell.styles.textColor = [200, 30, 30];
          else if (val === "MEDIUM") data.cell.styles.textColor = [180, 100, 0];
          else data.cell.styles.textColor = [30, 120, 30];
        }
      },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount} | Pure Air Guard Compliance Report | Confidential`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    doc.save(`PureAirGuard_Compliance_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  if (!config.showCompliance) {
    return (
      <Layout>
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Compliance Reports</h1>
        </div>
        <LockedFeature requiredTier={4} featureName="Compliance Reporting" className="min-h-[400px]">
          <div className="h-64 bg-muted/20 rounded-2xl" />
        </LockedFeature>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-amber-500" />
            <h1 className="text-3xl font-display font-bold text-foreground">Compliance Reports</h1>
          </div>
          <p className="text-muted-foreground">Legal-grade humidity and air quality logs for landlords and property managers.</p>
        </div>
        <button
          onClick={generatePDF}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all"
        >
          <Download className="w-5 h-5" />
          Generate PDF Report
        </button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Legal Proof Documentation</p>
          <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">These records are timestamped and can be used as evidence in property compliance disputes, insurance claims, and tenant communications.</p>
        </div>
      </div>

      <div ref={tableRef} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Humidity Log — All Locations</h2>
          <span className="text-sm text-muted-foreground">{readings?.length || 0} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Humidity</th>
                <th className="px-5 py-3">Temperature</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3 text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading records...</p>
                  </td>
                </tr>
              ) : readings?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p>No readings to report. Add sensor readings to build your compliance log.</p>
                  </td>
                </tr>
              ) : (
                readings?.map((r, idx) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3 text-foreground font-medium">
                      {format(new Date(r.recordedAt), "dd MMM yyyy")}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground font-mono text-xs">
                      {format(new Date(r.recordedAt), "HH:mm:ss")}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${r.humidity > 70 ? "text-red-600" : r.humidity > 60 ? "text-amber-600" : "text-emerald-600"}`}>
                        {r.humidity.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-foreground">{r.temperature.toFixed(1)}°C</td>
                    <td className="px-5 py-3 font-medium text-foreground">{r.roomName || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-md border border-border capitalize">{r.source}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                        r.mouldRiskScore > 70 ? "bg-red-100 text-red-700 dark:bg-red-900/30" :
                        r.mouldRiskScore > 40 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30" :
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"
                      }`}>
                        {r.mouldRiskScore > 70 ? "HIGH" : r.mouldRiskScore > 40 ? "MEDIUM" : "LOW"}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
