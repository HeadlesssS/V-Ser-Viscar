import { useState, useEffect } from "react";
import { downloadPdf } from "../../utils/pdfExport";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./admin.css";

const API = "/api";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - 5 + i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

const TAB_CONFIG = [
  { id: "daily", icon: "📅", label: "Daily", sub: "Report for a specific day" },
  {
    id: "monthly",
    icon: "📆",
    label: "Monthly",
    sub: "Report for a specific month",
  },
  {
    id: "yearly",
    icon: "🗓",
    label: "Yearly",
    sub: "Report across year range",
  },
];

const DETAIL_FIELDS = [
  { key: "totalSalesRevenue", label: "Sales Revenue", prefix: "Rs " },
  { key: "totalPurchaseCost", label: "Purchase Cost", prefix: "Rs " },
  { key: "grossProfit", label: "Gross Profit", prefix: "Rs ", bold: true },
  { key: "totalSalesInvoices", label: "Sales Invoices", prefix: "" },
  { key: "totalPurchaseInvoices", label: "Purchase Invoices", prefix: "" },
  { key: "totalUnitsSold", label: "Units Sold", prefix: "" },
  { key: "totalUnitsPurchased", label: "Units Purchased", prefix: "" },
];

const SEL = {
  padding: "9px 12px",
  border: "1px solid #e5e4e7",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "inherit",
  color: "#08060d",
  background: "#fff",
  outline: "none",
  cursor: "pointer",
  transition: "border-color .15s",
};

function ProfitMarginBadge({ revenue, cost }) {
  const margin =
    revenue > 0 ? (((revenue - cost) / revenue) * 100).toFixed(1) : "0.0";
  const color = margin >= 30 ? "#1a7a3a" : margin >= 10 ? "#b45309" : "#cc1e1e";
  const bg =
    margin >= 30
      ? "rgba(26,122,58,0.18)"
      : margin >= 10
        ? "rgba(180,83,9,0.18)"
        : "rgba(255,255,255,0.15)";
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color,
        background: bg,
        padding: "4px 10px",
        borderRadius: 6,
      }}
    >
      {margin}% margin
    </span>
  );
}

function ReportHeader({ report, tab, year, month, day, fromYear, toYear }) {
  const now = new Date();
  let periodLabel = "";
  if (tab === "daily")
    periodLabel = `${String(day).padStart(2, "0")} ${MONTHS[month - 1]} ${year}`;
  if (tab === "monthly") periodLabel = `${MONTHS[month - 1]} ${year}`;
  if (tab === "yearly") periodLabel = `${fromYear} – ${toYear}`;
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #7a0e0e 0%, #cc1e1e 100%)",
        borderRadius: "12px 12px 0 0",
        padding: "28px 32px 24px",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              opacity: 0.75,
              marginBottom: 8,
            }}
          >
            Financial Report — {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
          <h2
            style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#fff" }}
          >
            {periodLabel}
          </h2>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
            Generated on{" "}
            {now.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              opacity: 0.65,
              textTransform: "uppercase",
              letterSpacing: "0.7px",
              marginBottom: 6,
            }}
          >
            Gross Profit
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            Rs {fmt(report.grossProfit)}
          </div>
          <div style={{ marginTop: 8 }}>
            <ProfitMarginBadge
              revenue={report.totalSalesRevenue}
              cost={report.totalPurchaseCost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PLBar({ report }) {
  return (
    <div
      style={{
        background: "#fafafa",
        borderLeft: "1px solid #e5e4e7",
        borderRight: "1px solid #e5e4e7",
        padding: "16px 32px",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr auto 1fr",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#9c97a3",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            marginBottom: 4,
          }}
        >
          Revenue
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1a7a3a" }}>
          Rs {fmt(report.totalSalesRevenue)}
        </div>
      </div>
      <div style={{ fontSize: 20, color: "#d1cdd6", fontWeight: 300 }}>−</div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#9c97a3",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            marginBottom: 4,
          }}
        >
          Cost
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#cc1e1e" }}>
          Rs {fmt(report.totalPurchaseCost)}
        </div>
      </div>
      <div style={{ fontSize: 20, color: "#d1cdd6", fontWeight: 300 }}>=</div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#9c97a3",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            marginBottom: 4,
          }}
        >
          Gross Profit
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: report.grossProfit >= 0 ? "#1a4faa" : "#cc1e1e",
          }}
        >
          Rs {fmt(report.grossProfit)}
        </div>
      </div>
    </div>
  );
}

function AccordionRow({ b, index, maxRev }) {
  const [open, setOpen] = useState(false);
  const pct =
    maxRev > 0 ? Math.min((b.totalSalesRevenue / maxRev) * 100, 100) : 0;
  const costPct =
    b.totalSalesRevenue > 0
      ? Math.min((b.totalPurchaseCost / b.totalSalesRevenue) * 100, 100)
      : 0;
  const margin =
    b.totalSalesRevenue > 0
      ? ((b.grossProfit / b.totalSalesRevenue) * 100).toFixed(1)
      : "0.0";
  return (
    <div style={{ borderBottom: "1px solid #f3f2f4" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "grid",
          gridTemplateColumns: "100px 1fr 110px 110px 110px 28px",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          background: open ? "#fff8f8" : index % 2 === 0 ? "#fff" : "#fafafa",
          cursor: "pointer",
          userSelect: "none",
          transition: "background .12s",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#08060d" }}>
          {b.period}
        </span>
        <div
          style={{
            position: "relative",
            height: 8,
            background: "#f0f0f0",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              height: "100%",
              width: `${((pct * costPct) / 100).toFixed(1)}%`,
              background: "#cc1e1e",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              position: "absolute",
              height: "100%",
              left: `${((pct * costPct) / 100).toFixed(1)}%`,
              width: `${(pct * (1 - costPct / 100)).toFixed(1)}%`,
              background: "#1a4faa",
              borderRadius: 4,
            }}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            color: "#1a7a3a",
            fontWeight: 600,
            textAlign: "right",
          }}
        >
          Rs {fmt(b.totalSalesRevenue)}
        </span>
        <span style={{ fontSize: 12, color: "#cc1e1e", textAlign: "right" }}>
          Rs {fmt(b.totalPurchaseCost)}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "#1a4faa",
            fontWeight: 700,
            textAlign: "right",
          }}
        >
          Rs {fmt(b.grossProfit)}
        </span>
        <span
          style={{
            fontSize: 14,
            color: "#9c97a3",
            textAlign: "center",
            display: "inline-block",
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </div>
      {open && (
        <div
          style={{
            background: "#fff8f8",
            borderTop: "1px solid #f3e4e4",
            padding: "16px 24px 18px 36px",
          }}
        >
          {b.totalSalesRevenue === 0 && b.totalPurchaseCost === 0 && (
            <div
              style={{
                fontSize: 12,
                color: "#9c97a3",
                fontStyle: "italic",
                marginBottom: 10,
              }}
            >
              No transactions recorded for this period.
            </div>
          )}
          <table
            style={{ width: "100%", maxWidth: 400, borderCollapse: "collapse" }}
          >
            <tbody>
              {DETAIL_FIELDS.map((f) => (
                <tr key={f.key} style={{ borderBottom: "1px solid #f3e4e4" }}>
                  <td
                    style={{
                      padding: "7px 0",
                      fontSize: 12,
                      color: "#4b4756",
                      fontWeight: f.bold ? 600 : 400,
                    }}
                  >
                    {f.label}
                  </td>
                  <td
                    style={{
                      padding: "7px 0",
                      fontSize: 12,
                      fontWeight: f.bold ? 700 : 500,
                      color: f.bold ? "#cc1e1e" : "#08060d",
                      textAlign: "right",
                    }}
                  >
                    {f.prefix}
                    {fmt(b[f.key])}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  style={{ padding: "7px 0", fontSize: 12, color: "#4b4756" }}
                >
                  Profit Margin
                </td>
                <td
                  style={{
                    padding: "7px 0",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#08060d",
                    textAlign: "right",
                  }}
                >
                  {margin}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e4e7",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ fontWeight: 700, color: "#08060d", marginBottom: 6 }}>
        {label}
      </p>
      {payload.map((p) => (
        <p
          key={p.name}
          style={{ color: p.fill, margin: "3px 0", fontWeight: 500 }}
        >
          {p.name}: <strong>Rs {Number(p.value).toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

function OverallBarChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverall = async () => {
      try {
        const fromYear = CURRENT_YEAR - 4;
        const toYear = CURRENT_YEAR;
        const res = await fetch(
          `${API}/reports/financial/yearly?fromYear=${fromYear}&toYear=${toYear}`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data?.breakdown) {
          setChartData(
            data.breakdown.map((b) => ({
              name: b.period,
              Revenue: b.totalSalesRevenue,
              Cost: b.totalPurchaseCost,
              Profit: b.grossProfit,
            })),
          );
        }
      } catch {
        try {
          const res = await fetch(
            `${API}/reports/financial/monthly?year=${CURRENT_YEAR}`,
          );
          if (!res.ok) throw new Error();
          const data = await res.json();
          if (data) {
            setChartData([
              {
                name: "Revenue",
                value: data.totalSalesRevenue,
                fill: "#1a7a3a",
              },
              { name: "Cost", value: data.totalPurchaseCost, fill: "#cc1e1e" },
              { name: "Profit", value: data.grossProfit, fill: "#1a4faa" },
            ]);
          }
        } catch {
          // handled silently
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOverall();
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e4e7",
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#08060d" }}>
            Overall Financial Overview
          </div>
          <div style={{ fontSize: 12, color: "#9c97a3" }}>
            Revenue vs Cost vs Profit — {CURRENT_YEAR - 4} to {CURRENT_YEAR}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 11,
            alignItems: "center",
          }}
        >
          {[
            ["Revenue", "#1a7a3a"],
            ["Cost", "#cc1e1e"],
            ["Profit", "#1a4faa"],
          ].map(([l, c]) => (
            <div
              key={l}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: c,
                }}
              />
              <span style={{ color: "#6b6375" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      {loading ? (
        <div
          style={{
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9c97a3",
            fontSize: 13,
          }}
        >
          Loading…
        </div>
      ) : chartData.length === 0 ? (
        <div
          style={{
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9c97a3",
            fontSize: 13,
          }}
        >
          No data available yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            barGap={3}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#9c97a3" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9c97a3" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000000
                  ? `${(v / 1000000).toFixed(1)}M`
                  : v >= 1000
                    ? `${(v / 1000).toFixed(0)}k`
                    : v
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="Revenue"
              fill="#1a7a3a"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="Cost"
              fill="#cc1e1e"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="Profit"
              fill="#1a4faa"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function FinancialReportPage() {
  const [tab, setTab] = useState("monthly");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [fromYear, setFromYear] = useState(CURRENT_YEAR - 2);
  const [toYear, setToYear] = useState(CURRENT_YEAR);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const exportReportPdf = async () => {
    try {
      let path = "";
      let filename = "financial-report.pdf";
      if (tab === "daily") {
        path = `/financial/daily?year=${year}&month=${month}&day=${day}`;
        filename = `financial-daily-${year}-${month}-${day}.pdf`;
      } else if (tab === "monthly") {
        path = `/financial/monthly?year=${year}&month=${month}`;
        filename = `financial-monthly-${year}-${month}.pdf`;
      } else {
        path = `/financial/yearly?fromYear=${fromYear}&toYear=${toYear}`;
        filename = `financial-yearly-${fromYear}-${toYear}.pdf`;
      }
      await downloadPdf(path, filename);
    } catch (err) {
      alert(err.message || "PDF export failed");
    }
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    setReport(null);
    try {
      let url = "";
      if (tab === "daily")
        url = `${API}/reports/financial/daily?year=${year}&month=${month}&day=${day}`;
      if (tab === "monthly")
        url = `${API}/reports/financial/monthly?year=${year}&month=${month}`;
      if (tab === "yearly")
        url = `${API}/reports/financial/yearly?fromYear=${fromYear}&toYear=${toYear}`;
      const res = await fetch(url);
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message);
      }
      setReport(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const maxRev = report
    ? Math.max(...report.breakdown.map((b) => b.totalSalesRevenue), 1)
    : 1;

  return (
    <div className="page">
      <div className="ph">
        <div>
          <p className="ph-bc">Admin › Financial Reports</p>
          <h1 className="ph-title">Financial Reports</h1>
          <p className="ph-sub">
            View sales revenue, purchase costs and gross profit.
          </p>
        </div>
      </div>

      <OverallBarChart />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {TAB_CONFIG.map(({ id, icon, label, sub }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setReport(null);
              setError("");
            }}
            style={{
              flex: 1,
              padding: "14px 16px",
              background: tab === id ? "#fff0f0" : "#fff",
              border: `2px solid ${tab === id ? "#cc1e1e" : "#e5e4e7"}`,
              borderRadius: 12,
              cursor: "pointer",
              textAlign: "center",
              transition: "all .15s",
              fontFamily: "inherit",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 5 }}>{icon}</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: tab === id ? "#cc1e1e" : "#08060d",
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 11, color: "#9c97a3", marginTop: 2 }}>
              {sub}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e4e7",
          borderRadius: 12,
          padding: "18px 20px",
          marginBottom: 24,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "flex-end",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {tab === "daily" && (
          <>
            <div className="field">
              <label>Year</label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setReport(null);
                }}
                style={{ ...SEL, minWidth: 100 }}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Month</label>
              <select
                value={month}
                onChange={(e) => {
                  setMonth(Number(e.target.value));
                  setReport(null);
                }}
                style={{ ...SEL, minWidth: 140 }}
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Day</label>
              <select
                value={day}
                onChange={(e) => {
                  setDay(Number(e.target.value));
                  setReport(null);
                }}
                style={{ ...SEL, minWidth: 80 }}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {String(d).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {tab === "monthly" && (
          <>
            <div className="field">
              <label>Year</label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setReport(null);
                }}
                style={{ ...SEL, minWidth: 100 }}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Month</label>
              <select
                value={month}
                onChange={(e) => {
                  setMonth(Number(e.target.value));
                  setReport(null);
                }}
                style={{ ...SEL, minWidth: 140 }}
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {tab === "yearly" && (
          <>
            <div className="field">
              <label>From Year</label>
              <select
                value={fromYear}
                onChange={(e) => {
                  setFromYear(Number(e.target.value));
                  setReport(null);
                }}
                style={{ ...SEL, minWidth: 100 }}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>To Year</label>
              <select
                value={toYear}
                onChange={(e) => {
                  setToYear(Number(e.target.value));
                  setReport(null);
                }}
                style={{ ...SEL, minWidth: 100 }}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {toYear < fromYear && (
              <div
                style={{ fontSize: 12, color: "#cc1e1e", alignSelf: "center" }}
              >
                ⚠ "To Year" should be ≥ "From Year"
              </div>
            )}
          </>
        )}
        <button
          className="btn btn-p"
          onClick={generate}
          disabled={loading || (tab === "yearly" && toYear < fromYear)}
          style={{ alignSelf: "flex-end" }}
        >
          {loading ? "Generating…" : "Generate Report"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fff0f0",
            border: "1px solid rgba(204,30,30,0.3)",
            color: "#cc1e1e",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Report — centered, max width, clean */}
      {report && (
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-g" onClick={exportReportPdf}>
              📄 Export PDF
            </button>
          </div>
          <div
            style={{
              border: "1px solid #e5e4e7",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            <ReportHeader
              report={report}
              tab={tab}
              year={year}
              month={month}
              day={day}
              fromYear={fromYear}
              toYear={toYear}
            />
            <PLBar report={report} />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 110px 110px 110px 28px",
                gap: 12,
                padding: "9px 20px",
                background: "#f7f6f8",
                borderTop: "1px solid #e5e4e7",
                borderBottom: "1px solid #e5e4e7",
              }}
            >
              {["Period", "", "Revenue", "Cost", "Profit", ""].map((h, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#9c97a3",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    textAlign: i <= 1 ? "left" : "right",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            <div style={{ background: "#fff" }}>
              {report.breakdown.map((b, i) => (
                <AccordionRow key={b.period} b={b} index={i} maxRev={maxRev} />
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 110px 110px 110px 28px",
                gap: 12,
                padding: "14px 20px",
                background: "#fff0f0",
                borderTop: "2px solid #cc1e1e",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#08060d" }}>
                Total
              </span>
              <span />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1a7a3a",
                  textAlign: "right",
                }}
              >
                Rs {fmt(report.totalSalesRevenue)}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#cc1e1e",
                  textAlign: "right",
                }}
              >
                Rs {fmt(report.totalPurchaseCost)}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1a4faa",
                  textAlign: "right",
                }}
              >
                Rs {fmt(report.grossProfit)}
              </span>
              <span />
            </div>
          </div>
        </div>
      )}

      {!report && !loading && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p>Select a report type and click Generate Report.</p>
        </div>
      )}
    </div>
  );
}
