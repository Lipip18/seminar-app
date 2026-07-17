import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";

/* ── helpers ─────────────────────────────────────────────────── */
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const STATUS_CFG = {
  Approved: { bg: "#f0fdf4", border: "#86efac", color: "#15803d", dot: "#16a34a" },
  Rejected: { bg: "#fef2f2", border: "#fca5a5", color: "#b91c1c", dot: "#dc2626" },
  Pending: { bg: "#fffbeb", border: "#fcd34d", color: "#b45309", dot: "#d97706" },
};

const StatusPill = ({ status }) => {
  const s = STATUS_CFG[status] || STATUS_CFG.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
};

/* ── Cancel confirm modal ───────────────────────────────────── */
const CancelModal = ({ booking, onClose, onConfirm, loading }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "1rem",
  }} onClick={onClose}>
    <div style={{
      background: "#fff", borderRadius: 16, width: "100%", maxWidth: 380,
      padding: "1.5rem", animation: "fadeUp 0.2s ease",
    }} onClick={(e) => e.stopPropagation()}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%", marginBottom: 14,
        background: "#fef2f2",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
      }}>
        ✕
      </div>
      <h2 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
        Cancel booking?
      </h2>
      <p style={{ margin: "0 0 6px", fontSize: 14, color: "#374151" }}>
        {booking.hallId?.name || "Deleted hall"}
      </p>
      <p style={{ margin: "0 0 1.5rem", fontSize: 13, color: "#64748b" }}>
        {fmt(booking.date)} · {booking.startTime} – {booking.endTime}
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{
          height: 38, padding: "0 18px", borderRadius: 8,
          border: "1px solid #e2e8f0", background: "transparent",
          color: "#64748b", fontSize: 14, cursor: "pointer",
        }}>Keep booking</button>
        <button onClick={onConfirm} disabled={loading} style={{
          height: 38, padding: "0 20px", borderRadius: 8, border: "none",
          background: loading ? "#fca5a5" : "#dc2626",
          color: "#fff", fontSize: 14, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Cancelling…" : "Cancel booking"}
        </button>
      </div>
    </div>
  </div>
);

/* ── Stat card ───────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, accent, sub }) => (
  <div style={{
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
    padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: 12,
    borderTop: `3px solid ${accent}`,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <p style={{ margin: 0, fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</p>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: accent + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>{icon}</div>
    </div>
    <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>{value}</p>
    {sub && <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{sub}</p>}
  </div>
);

/* ── Mini bar chart ──────────────────────────────────────────── */
const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", borderRadius: "4px 4px 0 0",
            height: Math.max(6, (d.value / max) * 50),
            background: d.color,
          }} />
          <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Main ────────────────────────────────────────────────────── */
export default function FacultyDashboard() {
  const { api, user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalBookings: 0, upcoming: 0, pending: 0, approved: 0, rejected: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModal, setCancelModal] = useState(null); // booking
  const [cancelLoading, setCancelLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/bookings?sort=-createdAt");
      const myBookings = res.data.data || [];

      const now = new Date();
      const upcoming = myBookings.filter((b) => new Date(b.date) > now && b.status === "Approved").length;
      const pending = myBookings.filter((b) => b.status === "Pending").length;
      const approved = myBookings.filter((b) => b.status === "Approved").length;
      const rejected = myBookings.filter((b) => b.status === "Rejected").length;

      setAllBookings(myBookings);
      setRecentBookings(myBookings);
      setStats({
        totalBookings: myBookings.length,
        upcoming,
        pending,
        approved,
        rejected,
      });
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const confirmCancel = async () => {
    if (!cancelModal) return;
    setCancelLoading(true);
    try {
      await api.delete(`/bookings/${cancelModal._id}`);
      toast.success("Booking cancelled");
      setCancelModal(null);
      fetchData(true);
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelLoading(false);
    }
  };

  /* filter table */
  const displayed = recentBookings.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.hallId?.name?.toLowerCase().includes(q) ||
      b.purpose?.toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  /* chart data */
  const chartData = [
    { label: "Pending", value: stats.pending, color: "#f59e0b" },
    { label: "Approved", value: stats.approved, color: "#16a34a" },
    { label: "Rejected", value: stats.rejected, color: "#dc2626" },
  ];

  /* approval rate */
  const approvalRate = stats.totalBookings > 0
    ? Math.round((stats.approved / stats.totalBookings) * 100) : 0;

  const inp = {
    height: 36, padding: "0 12px", fontSize: 13, border: "1px solid #e2e8f0",
    borderRadius: 8, background: "#fff", color: "#374151", outline: "none", fontFamily: "inherit",
  };

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Loading dashboard…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem 1.5rem", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
            Welcome, {user?.name || "Faculty"}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button onClick={() => fetchData(true)} disabled={refreshing} style={{
          display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 16px",
          borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff",
          color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          opacity: refreshing ? 0.6 : 1,
        }}>
          <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none", fontSize: 16 }}>↻</span>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: "1.5rem" }}>
        <StatCard label="Total bookings" value={stats.totalBookings} icon="🏛" accent="#2563eb" sub="All-time requests" />
        <StatCard label="Upcoming events" value={stats.upcoming} icon="📅" accent="#7c3aed" sub="Approved & upcoming" />
        <StatCard label="Pending requests" value={stats.pending} icon="⏳" accent="#f59e0b" sub="Awaiting approval" />
        <StatCard label="Approved bookings" value={stats.approved} icon="✓" accent="#16a34a" sub={`${approvalRate}% approval rate`} />
      </div>

      {/* Second row: chart + summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: "1.5rem" }}>
        {/* Booking breakdown */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "1.25rem 1.5rem", gridColumn: "span 1" }}>
          <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Booking breakdown</p>
          <MiniBarChart data={chartData} />
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            {chartData.map((d) => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: 12, color: "#64748b" }}>{d.label} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Approval rate ring */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#0f172a", alignSelf: "flex-start" }}>Approval rate</p>
          <div style={{ position: "relative", width: 90, height: 90 }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="36" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="45" cy="45" r="36" fill="none" stroke="#16a34a" strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - approvalRate / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 45 45)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{approvalRate}%</span>
            </div>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b" }}>of {stats.totalBookings} total bookings</p>
        </div>

        {/* Quick stats */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "1.25rem 1.5rem" }}>
          <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Quick overview</p>
          {[
            { label: "Upcoming events", value: `${stats.upcoming}`, bar: stats.totalBookings > 0 ? (stats.upcoming / stats.totalBookings) * 100 : 0, color: "#7c3aed" },
            { label: "Pending rate", value: `${stats.totalBookings > 0 ? Math.round((stats.pending / stats.totalBookings) * 100) : 0}%`, bar: stats.totalBookings > 0 ? (stats.pending / stats.totalBookings) * 100 : 0, color: "#f59e0b" },
            { label: "Rejection rate", value: `${stats.totalBookings > 0 ? Math.round((stats.rejected / stats.totalBookings) * 100) : 0}%`, bar: stats.totalBookings > 0 ? (stats.rejected / stats.totalBookings) * 100 : 0, color: "#dc2626" },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{item.value}</span>
              </div>
              <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${Math.min(item.bar, 100)}%`, background: item.color, borderRadius: 2, transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Bookings Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        {/* Table header + filters */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: "0.875rem" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>My bookings</h2>
            {stats.pending > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "#fffbeb", border: "1px solid #fcd34d", color: "#b45309" }}>
                {stats.pending} pending
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 180px" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14, pointerEvents: "none" }}>⌕</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hall or purpose…"
                style={{ ...inp, width: "100%", paddingLeft: 28, boxSizing: "border-box" }} />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inp }}>
              <option value="all">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Hall", "Date & time", "Purpose", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                    <p style={{ fontSize: 28, margin: "0 0 8px" }}>📋</p>
                    <p style={{ margin: 0, fontWeight: 500 }}>You haven't made any bookings yet</p>
                  </td>
                </tr>
              ) : displayed.map((b, idx) => (
                <tr key={b._id}
                  style={{ borderTop: "1px solid #f8fafc", background: idx % 2 === 0 ? "#fff" : "#fafafa", transition: "background 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f0f9ff"}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"}>

                  {/* Hall */}
                  <td style={{ padding: "12px 16px" }}>
                    <p style={{ margin: 0, fontWeight: 500, color: "#0f172a" }}>{b.hallId?.name || "Deleted hall"}</p>
                    {b.hallId?.location?.building && (
                      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{b.hallId.location.building}</p>
                    )}
                  </td>

                  {/* Date & time */}
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    <p style={{ margin: 0, fontWeight: 500, color: "#374151" }}>{fmt(b.date)}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{b.startTime} – {b.endTime}</p>
                  </td>

                  {/* Purpose */}
                  <td style={{ padding: "12px 16px", maxWidth: 200 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={b.purpose}>
                      {b.purpose || "—"}
                    </p>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "12px 16px" }}>
                    <StatusPill status={b.status} />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px" }}>
                    {(b.status === "Pending" || b.status === "Approved") ? (
                      <button onClick={() => setCancelModal(b)}
                        style={{ height: 32, padding: "0 12px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fef2f2", color: "#b91c1c", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Cancel
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentBookings.length > 0 && (
          <div style={{ padding: "0.875rem 1.5rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Showing {displayed.length} of {allBookings.length} bookings</p>
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {cancelModal && (
        <CancelModal
          booking={cancelModal}
          onClose={() => setCancelModal(null)}
          onConfirm={confirmCancel}
          loading={cancelLoading}
        />
      )}
    </div>
  );
}