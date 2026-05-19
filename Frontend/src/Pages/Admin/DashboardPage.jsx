import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
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
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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
      <p style={{ fontWeight: 600, color: "#08060d", marginBottom: 4 }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}:{" "}
          <strong>
            {typeof p.value === "number" && p.name.toLowerCase().includes("rs")
              ? `Rs ${p.value.toLocaleString()}`
              : p.value}
          </strong>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    vendors: 0,
    invoices: 0,
    totalSpent: 0,
    partsInStock: 0,
    lowStock: 0,
    totalParts: 0,
  });
  const [parts, setParts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  useEffect(() => {
    Promise.all([
      fetch(`${API}/vendors`)
        .then((r) => r.json())
        .catch(() => []),
      fetch(`${API}/purchase-invoices`)
        .then((r) => r.json())
        .catch(() => []),
      fetch(`${API}/parts`)
        .then((r) => r.json())
        .catch(() => []),
    ]).then(([vendors, inv, pts]) => {
      setInvoices(Array.isArray(inv) ? inv : []);
      setParts(Array.isArray(pts) ? pts : []);
      setStats({
        vendors: Array.isArray(vendors)
          ? vendors.filter((v) => v.isActive).length
          : 0,
        invoices: Array.isArray(inv) ? inv.length : 0,
        totalSpent: Array.isArray(inv)
          ? inv.reduce((s, i) => s + i.totalAmount, 0)
          : 0,
        totalParts: Array.isArray(pts) ? pts.length : 0,
        partsInStock: Array.isArray(pts)
          ? pts.reduce((s, p) => s + p.stockQuantity, 0)
          : 0,
        lowStock: Array.isArray(pts)
          ? pts.filter((p) => p.isLowStock).length
          : 0,
      });
    });
  }, []);

  // Monthly purchase spend
  const monthlySpend = MONTHS.map((month, i) => {
    const monthInvoices = invoices.filter(
      (inv) => new Date(inv.purchaseDate).getMonth() === i,
    );
    return {
      month,
      "Rs Spent": monthInvoices.reduce((s, inv) => s + inv.totalAmount, 0),
      Invoices: monthInvoices.length,
    };
  });

  // Top 6 parts by stock quantity
  const topParts = [...parts]
    .sort((a, b) => b.stockQuantity - a.stockQuantity)
    .slice(0, 6)
    .map((p) => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
      Stock: p.stockQuantity,
    }));

  const PIE_COLORS = [
    "#cc1e1e",
    "#1a4faa",
    "#1a7a3a",
    "#b05a00",
    "#6b1a8a",
    "#1a7a7a",
  ];

  const CARDS = [
    {
      icon: "🏭",
      num: stats.vendors,
      label: "Active Vendors",
      sub: "Operational suppliers",
      color: "#cc1e1e",
    },
    {
      icon: "🔧",
      num: stats.totalParts,
      label: "Total Parts",
      sub: "In catalog",
      color: "#1a4faa",
    },
    {
      icon: "📦",
      num: stats.partsInStock,
      label: "Units in Stock",
      sub: `${stats.lowStock} low stock`,
      color: "#1a7a3a",
    },
    {
      icon: "🧾",
      num: stats.invoices,
      label: "Purchase Invoices",
      sub: "Total recorded",
      color: "#b05a00",
    },
    {
      icon: "💰",
      num: `Rs ${stats.totalSpent.toLocaleString()}`,
      label: "Total Purchased",
      sub: "Cumulative cost",
      color: "#cc1e1e",
    },
    {
      icon: "⚠",
      num: stats.lowStock,
      label: "Low Stock Alerts",
      sub: "Need restocking",
      color: stats.lowStock > 0 ? "#b05a00" : "#1a7a3a",
    },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="ph">
        <div>
          <p className="ph-bc">Admin Panel</p>
          <h1 className="ph-title">Dashboard</h1>
          <p className="ph-sub">Welcome back! Here's your business overview.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {CARDS.map((c) => (
          <div
            key={c.label}
            style={{
              background: "#fff",
              border: "1px solid #e5e4e7",
              borderRadius: 14,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              position: "relative",
              overflow: "hidden",
              transition: "transform .18s, box-shadow .18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
            }}
          >
            {/* Top accent line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${c.color}, transparent)`,
                borderRadius: "14px 14px 0 0",
              }}
            />
            <div style={{ fontSize: 26 }}>{c.icon}</div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: c.color,
                lineHeight: 1,
              }}
            >
              {c.num}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#08060d" }}>
              {c.label}
            </div>
            <div style={{ fontSize: 11, color: "#9c97a3" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row — Monthly Spend + Top Parts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Monthly Purchase Spend */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e4e7",
            borderRadius: 14,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#08060d" }}>
                Monthly Purchase Spend
              </div>
              <div style={{ fontSize: 12, color: "#9c97a3" }}>
                Purchase invoice totals per month
              </div>
            </div>
            <div
              style={{
                background: "#fff0f0",
                border: "1px solid rgba(204,30,30,0.2)",
                color: "#cc1e1e",
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 20,
              }}
            >
              Rs {stats.totalSpent.toLocaleString()}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={monthlySpend}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cc1e1e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#cc1e1e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9c97a3" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9c97a3" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v > 0 ? `${(v / 1000).toFixed(0)}k` : "0"
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="Rs Spent"
                stroke="#cc1e1e"
                strokeWidth={2}
                fill="url(#spendGrad)"
                dot={{ fill: "#cc1e1e", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Parts by Stock */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e4e7",
            borderRadius: 14,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#08060d" }}>
              Top Parts by Stock
            </div>
            <div style={{ fontSize: 12, color: "#9c97a3" }}>
              Top 6 parts with highest stock quantity
            </div>
          </div>
          {topParts.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9c97a3",
                fontSize: 13,
                height: 200,
              }}
            >
              No parts data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topParts}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
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
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Stock" radius={[4, 4, 0, 0]}>
                  {topParts.map((_, i) => (
                    <Bar
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
