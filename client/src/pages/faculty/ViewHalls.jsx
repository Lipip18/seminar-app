import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";

/* ── shared tokens ───────────────────────────────────────────── */
const C = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  borderSoft: "#eef2f7",
  text: "#0f172a",
  sub: "#64748b",
  faint: "#94a3b8",
  primary: "#2563eb",
  primarySoft: "#eff6ff",
  violet: "#7c3aed",
  green: "#16a34a",
  greenBg: "#f0fdf4",
  greenBorder: "#86efac",
  red: "#dc2626",
  redBg: "#fef2f2",
  redBorder: "#fca5a5",
};

const isAvailable = (hall) =>
  hall.isActive !== false && hall.status !== "Booked" && hall.status !== "Unavailable";

/* ── small building-glyph icon (no external deps) ───────────── */
const HallGlyph = ({ size = 56, muted = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ opacity: muted ? 0.55 : 1 }}>
    <path d="M4 21V10.5L12 5l8 5.5V21" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M2.5 10.5 12 4l9.5 6.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="9.5" y="14.5" width="5" height="6.5" stroke="#fff" strokeWidth="1.4" />
    <rect x="6" y="12" width="2" height="2" stroke="#fff" strokeWidth="1.2" />
    <rect x="16" y="12" width="2" height="2" stroke="#fff" strokeWidth="1.2" />
  </svg>
);

/* ── badge ───────────────────────────────────────────────────── */
const Badge = ({ ok, children }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
    background: ok ? C.greenBg : C.redBg,
    color: ok ? "#15803d" : "#b91c1c",
    border: `1px solid ${ok ? C.greenBorder : C.redBorder}`,
    whiteSpace: "nowrap",
  }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: ok ? C.green : C.red }} />
    {children}
  </span>
);

/* ── hall card ───────────────────────────────────────────────── */
const HallCard = ({ hall, onView, onBook }) => {
  const [hovered, setHovered] = useState(false);
  const available = isAvailable(hall);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card, borderRadius: 18, overflow: "hidden",
        border: `1px solid ${C.border}`, display: "flex", flexDirection: "column",
        boxShadow: hovered ? "0 12px 28px -12px rgba(15,23,42,0.18)" : "0 1px 3px rgba(15,23,42,0.04)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
    >
      {/* Banner */}
      <div style={{
        height: 148, position: "relative",
        background: `linear-gradient(135deg, ${C.primary}, ${C.violet})`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.15,
          backgroundImage: "radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 85% 75%, #fff 0, transparent 35%)",
        }} />
        <HallGlyph size={54} />
        <div style={{ position: "absolute", top: 14, right: 14 }}>
          <Badge ok={available}>{available ? "Available" : "Unavailable"}</Badge>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.35rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>
          {hall.name}
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.sub, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13 }}>📍</span>
          {hall.location?.building || "Campus Building"}
        </p>

        <p style={{
          margin: "14px 0 0", fontSize: 13.5, lineHeight: 1.65, color: "#475569",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {hall.description || "Seminar hall available for workshops, academic events and presentations."}
        </p>

        {/* Stats */}
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: C.bg, borderRadius: 12, padding: "0.75rem 0.9rem", border: `1px solid ${C.borderSoft}` }}>
            <p style={{ margin: 0, fontSize: 11, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Capacity</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: C.text }}>{hall.capacity || 0}</p>
          </div>
          <div style={{ background: C.bg, borderRadius: 12, padding: "0.75rem 0.9rem", border: `1px solid ${C.borderSoft}` }}>
            <p style={{ margin: 0, fontSize: 11, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Facilities</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: C.text }}>{(hall.facilities || hall.amenities || []).length || 0}</p>
          </div>
        </div>

        {/* Facility chips */}
        {(hall.facilities || hall.amenities || []).length > 0 && (
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(hall.facilities || hall.amenities || []).slice(0, 4).map((f, i) => (
              <span key={i} style={{
                padding: "4px 10px", borderRadius: 999, background: C.primarySoft,
                color: C.primary, fontSize: 11.5, fontWeight: 600,
              }}>{f}</span>
            ))}
            {(hall.facilities || hall.amenities || []).length > 4 && (
              <span style={{ padding: "4px 10px", borderRadius: 999, background: C.bg, color: C.sub, fontSize: 11.5, fontWeight: 600 }}>
                +{(hall.facilities || hall.amenities || []).length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Spacer pushes footer down for equal card heights */}
        <div style={{ flex: 1 }} />

        {/* Footer buttons */}
        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <button
            onClick={() => onView(hall)}
            style={{
              flex: 1, height: 42, borderRadius: 10, border: `1px solid ${C.border}`,
              background: "#fff", color: C.text, fontWeight: 600, fontSize: 13.5, cursor: "pointer",
            }}
          >
            View details
          </button>
          {available && (
            <button
              onClick={() => onBook(hall._id)}
              style={{
                flex: 1, height: 42, borderRadius: 10, border: "none",
                background: C.primary, color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
              }}
            >
              Book hall
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── details modal ──────────────────────────────────────────── */
const HallModal = ({ hall, onClose, onBook }) => {
  const available = isAvailable(hall);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 20, backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560, background: "#fff", borderRadius: 20,
          overflow: "hidden", maxHeight: "88vh", display: "flex", flexDirection: "column",
          animation: "fadeUp 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{
          height: 180, position: "relative", flexShrink: 0,
          background: `linear-gradient(135deg, ${C.primary}, ${C.violet})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <HallGlyph size={64} />
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 999,
            border: "none", background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Content (scrollable) */}
        <div style={{ padding: "1.75rem", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>{hall.name}</h2>
              <p style={{ margin: "5px 0 0", color: C.sub, fontSize: 13.5 }}>
                📍 {hall.location?.building || "Campus Building"}
              </p>
            </div>
            <Badge ok={available}>{available ? "Available" : "Unavailable"}</Badge>
          </div>

          <p style={{ marginTop: 18, lineHeight: 1.75, color: "#475569", fontSize: 14.5 }}>
            {hall.description || "Seminar hall available for workshops, academic events and presentations."}
          </p>

          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: C.bg, borderRadius: 12, padding: "0.9rem 1rem", border: `1px solid ${C.borderSoft}` }}>
              <p style={{ margin: 0, fontSize: 11, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Seating capacity</p>
              <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: C.text }}>{hall.capacity || 0}</p>
            </div>
            <div style={{ background: C.bg, borderRadius: 12, padding: "0.9rem 1rem", border: `1px solid ${C.borderSoft}` }}>
              <p style={{ margin: 0, fontSize: 11, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Facilities</p>
              <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: C.text }}>{(hall.facilities || hall.amenities || []).length || 0}</p>
            </div>
          </div>

          {(hall.facilities || hall.amenities || []).length > 0 && (
            <div style={{ marginTop: 22 }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#334155" }}>Available facilities</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(hall.facilities || hall.amenities || []).map((f, i) => (
                  <span key={i} style={{
                    padding: "7px 12px", borderRadius: 999, background: C.primarySoft,
                    color: C.primary, fontSize: 12.5, fontWeight: 600,
                  }}>{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: "1.25rem 1.75rem", borderTop: `1px solid ${C.borderSoft}`, display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{
            flex: 1, height: 46, borderRadius: 12, border: `1px solid ${C.border}`,
            background: "#fff", color: C.text, fontWeight: 600, cursor: "pointer",
          }}>Close</button>
          {available && (
            <button onClick={() => onBook(hall._id)} style={{
              flex: 1, height: 46, borderRadius: 12, border: "none",
              background: C.primary, color: "#fff", fontWeight: 700, cursor: "pointer",
            }}>Book this hall</button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── main ────────────────────────────────────────────────────── */
const ViewHalls = () => {
  const { api } = useContext(AuthContext);
  const navigate = useNavigate();

  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHall, setSelectedHall] = useState(null);

  useEffect(() => { fetchHalls(); }, [api]);

  const fetchHalls = async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      const res = await api.get("/halls");
      setHalls(res.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load halls");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        hall.name?.toLowerCase().includes(q) ||
        hall.location?.building?.toLowerCase().includes(q);

      const matchesCapacity =
        capacityFilter === "all" ||
        (capacityFilter === "small" && hall.capacity <= 50) ||
        (capacityFilter === "medium" && hall.capacity > 50 && hall.capacity <= 150) ||
        (capacityFilter === "large" && hall.capacity > 150);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isAvailable(hall)) ||
        (statusFilter === "inactive" && !isAvailable(hall));

      return matchesSearch && matchesCapacity && matchesStatus;
    });
  }, [halls, search, capacityFilter, statusFilter]);

  const handleBookHall = (hallId) => navigate(`/faculty/book-hall/${hallId}`);

  const selectStyle = {
    height: 44, padding: "0 14px", borderRadius: 10,
    border: `1px solid ${C.border}`, background: "#fff",
    outline: "none", fontSize: 13.5, color: "#334155", fontWeight: 500, cursor: "pointer",
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: C.bg, flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, border: "4px solid #e2e8f0", borderTopColor: C.primary,
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ margin: 0, color: C.sub, fontSize: 14 }}>Loading halls…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, padding: "2rem",
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{
        marginBottom: "1.5rem",
        padding: "1.35rem 1.4rem",
        borderRadius: 24,
        background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
        border: `1px solid ${C.border}`,
        boxShadow: "0 16px 35px -24px rgba(37,99,235,0.35)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: "#dbeafe", color: C.primary, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
              <span style={{ fontSize: 13 }}>🏛</span>
              Faculty hall explorer
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>
              Available seminar halls
            </h1>
            <p style={{ marginTop: 6, color: C.sub, fontSize: 14, maxWidth: 560 }}>
              Browse halls added by administration and choose the right space for your next event.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ padding: "10px 12px", borderRadius: 14, background: "#fff", border: `1px solid ${C.borderSoft}`, minWidth: 110 }}>
              <p style={{ margin: 0, fontSize: 11, color: C.faint, textTransform: "uppercase", fontWeight: 700 }}>Available</p>
              <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 800, color: C.text }}>{halls.filter((hall) => isAvailable(hall)).length}</p>
            </div>
            <button onClick={() => fetchHalls(true)} disabled={refreshing} style={{
              height: 44, padding: "0 16px", borderRadius: 12, border: `1px solid ${C.border}`,
              background: "#fff", cursor: refreshing ? "not-allowed" : "pointer", fontWeight: 700,
              color: C.text, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8,
              opacity: refreshing ? 0.6 : 1,
            }}>
              <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>↻</span>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18,
        padding: "1rem", marginBottom: "1.75rem", display: "flex", gap: 12, flexWrap: "wrap",
        boxShadow: "0 8px 24px -18px rgba(15,23,42,0.22)",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: C.faint, fontSize: 15, pointerEvents: "none",
          }}>⌕</span>
          <input
            type="text"
            placeholder="Search hall or building…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", height: 44, padding: "0 14px 0 36px", borderRadius: 10,
              border: `1px solid ${C.border}`, outline: "none", fontSize: 14,
              background: "#fff", boxSizing: "border-box", color: "#334155",
            }}
          />
        </div>

        <select value={capacityFilter} onChange={(e) => setCapacityFilter(e.target.value)} style={selectStyle}>
          <option value="all">All capacities</option>
          <option value="small">Small (≤ 50)</option>
          <option value="medium">Medium (51–150)</option>
          <option value="large">Large (150+)</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All status</option>
          <option value="active">Available</option>
          <option value="inactive">Unavailable</option>
        </select>
      </div>

      {/* Results count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: "1rem", flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 13, color: C.faint }}>
          {filteredHalls.length} hall{filteredHalls.length !== 1 ? "s" : ""} found
        </p>
        {(search || capacityFilter !== "all" || statusFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setCapacityFilter("all"); setStatusFilter("all"); }}
            style={{ border: `1px solid ${C.border}`, background: "#fff", color: C.sub, borderRadius: 999, padding: "6px 12px", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid / empty state */}
      {filteredHalls.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 18, border: `1px solid ${C.border}`,
          padding: "4rem 2rem", textAlign: "center",
        }}>
          <div style={{ fontSize: 46, marginBottom: 14 }}>🏛</div>
          <h2 style={{ margin: 0, color: C.text, fontSize: 18 }}>No halls match your filters</h2>
          <p style={{ marginTop: 8, color: C.sub, fontSize: 14 }}>
            Try broadening your search or resetting the status and capacity filters.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
          {filteredHalls.map((hall) => (
            <HallCard
              key={hall._id}
              hall={hall}
              onView={setSelectedHall}
              onBook={handleBookHall}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedHall && (
        <HallModal
          hall={selectedHall}
          onClose={() => setSelectedHall(null)}
          onBook={handleBookHall}
        />
      )}
    </div>
  );
};

export default ViewHalls;