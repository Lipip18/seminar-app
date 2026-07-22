import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

const ViewHalls = () => {
  const { api } = useContext(AuthContext);

  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState(null);
  const [search, setSearch] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      setLoading(true);

      const res = await api.get("/halls");

      setHalls(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch halls:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const filteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        hall.name?.toLowerCase().includes(q) ||
        hall.location?.building?.toLowerCase().includes(q) ||
        hall.description?.toLowerCase().includes(q);

      const matchesCapacity =
        capacityFilter === "all" ||
        (capacityFilter === "small" && hall.capacity <= 50) ||
        (capacityFilter === "medium" && hall.capacity > 50 && hall.capacity <= 150) ||
        (capacityFilter === "large" && hall.capacity > 150);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && hall.isActive !== false) ||
        (statusFilter === "inactive" && hall.isActive === false);

      return matchesSearch && matchesCapacity && matchesStatus;
    });
  }, [halls, search, capacityFilter, statusFilter]);

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading halls…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.heroCard}>
        <div>
          <div style={styles.heroEyebrow}>Student view</div>
          <h1 style={styles.title}>Explore seminar halls</h1>
          <p style={styles.subtitle}>
            Browse available spaces, review facilities, and find the right hall for your event.
          </p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Available</span>
            <strong style={styles.statValue}>{halls.filter((hall) => hall.isActive !== false).length}</strong>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total halls</span>
            <strong style={styles.statValue}>{halls.length}</strong>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="Search hall or building…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select
          value={capacityFilter}
          onChange={(e) => setCapacityFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All capacities</option>
          <option value="small">Small (≤ 50)</option>
          <option value="medium">Medium (51–150)</option>
          <option value="large">Large (150+)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All status</option>
          <option value="active">Available</option>
          <option value="inactive">Unavailable</option>
        </select>
      </div>

      <div style={styles.summaryRow}>
        <span style={styles.summaryText}>
          Showing {filteredHalls.length} of {halls.length} halls
        </span>
      </div>

      {/* HALL GRID */}
      <div style={styles.grid}>
        {filteredHalls.map((hall) => (
          <div
            key={hall._id}
            style={styles.card}
            onClick={() => setSelectedHall(hall)}
          >
            <div style={styles.cardTop}>
              <div style={styles.avatar}>
                {getInitials(hall.name)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                  <h2 style={styles.hallName}>
                    {hall.name}
                  </h2>

                  <span
                    style={{
                      ...styles.status,
                      background: hall.isActive
                        ? "#ecfdf5"
                        : "#fef2f2",
                      color: hall.isActive
                        ? "#047857"
                        : "#b91c1c",
                      border: hall.isActive
                        ? "1px solid #a7f3d0"
                        : "1px solid #fecaca",
                    }}
                  >
                    {hall.isActive
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>

                <p style={styles.location}>
                  {hall.location?.building || "Campus building"}
                </p>
              </div>
            </div>

            <p style={styles.description}>
              {hall.description ||
                "No description available"}
            </p>

            <div style={styles.infoRow}>
              <div style={styles.infoCard}>
                <p style={styles.infoLabel}>
                  Capacity
                </p>
                <h3 style={styles.infoValue}>
                  {hall.capacity}
                </h3>
              </div>

              <div style={styles.infoCard}>
                <p style={styles.infoLabel}>
                  Facilities
                </p>
                <h3 style={styles.infoValue}>
                  {hall.facilities?.length || 0}
                </h3>
              </div>
            </div>

            {(hall.facilities || hall.amenities || []).length > 0 && (
              <div style={styles.facilitiesWrap}>
                {(hall.facilities || hall.amenities || [])
                  .slice(0, 4)
                  .map((facility, index) => (
                    <span
                      key={index}
                      style={styles.facility}
                    >
                      {facility}
                    </span>
                  ))}

                {(hall.facilities || hall.amenities || []).length > 4 && (
                  <span style={styles.moreFacility}>
                    +{(hall.facilities || hall.amenities || []).length - 4}
                  </span>
                )}
              </div>
            )}

            <button style={styles.viewBtn}>
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {!loading && filteredHalls.length === 0 && (
        <div style={styles.emptyState}>
          <svg
            width="60"
            height="60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7.5L12 3l9 4.5M4.5 9v8.25A2.25 2.25 0 006.75 19.5h10.5A2.25 2.25 0 0019.5 17.25V9"
            />
          </svg>

          <h3 style={styles.emptyTitle}>
            {halls.length === 0 ? "No halls available right now" : "No halls match the current filters"}
          </h3>

          <p style={styles.emptyText}>
            {halls.length === 0
              ? "There are currently no seminar halls added to the system."
              : "Try adjusting the search or filter options to see more halls."}
          </p>
        </div>
      )}

      {/* MODAL */}
      {selectedHall && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedHall(null)}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div style={styles.modalHeader}>
              <div style={styles.modalTop}>
                <div style={styles.modalAvatar}>
                  {getInitials(selectedHall.name)}
                </div>

                <div>
                  <h2 style={styles.modalTitle}>
                    {selectedHall.name}
                  </h2>

                  <span
                    style={{
                      ...styles.status,
                      background: selectedHall.isActive
                        ? "#ecfdf5"
                        : "#fef2f2",
                      color: selectedHall.isActive
                        ? "#047857"
                        : "#b91c1c",
                      border: selectedHall.isActive
                        ? "1px solid #a7f3d0"
                        : "1px solid #fecaca",
                    }}
                  >
                    {selectedHall.isActive
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>
              </div>

              <button
                style={styles.closeBtn}
                onClick={() => setSelectedHall(null)}
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div style={styles.modalBody}>
              {/* DESCRIPTION */}
              <div>
                <p style={styles.modalLabel}>
                  Description
                </p>

                <p style={styles.modalDescription}>
                  {selectedHall.description ||
                    "No description available"}
                </p>
              </div>

              {/* CAPACITY */}
              <div>
                <p style={styles.modalLabel}>
                  Capacity
                </p>

                <div style={styles.capacityCard}>
                  {selectedHall.capacity} People
                </div>
              </div>

              {/* FACILITIES */}
              <div>
                <p style={styles.modalLabel}>
                  Facilities
                </p>

                <div style={styles.modalFacilities}>
                  {(selectedHall.facilities || selectedHall.amenities || []).length > 0 ? (
                    (selectedHall.facilities || selectedHall.amenities || []).map(
                      (facility, index) => (
                        <span
                          key={index}
                          style={styles.modalFacility}
                        >
                          {facility}
                        </span>
                      )
                    )
                  ) : (
                    <p style={styles.noFacilities}>
                      No facilities added
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "2rem",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
    gap: 16,
  },

  spinner: {
    width: 38,
    height: 38,
    border: "3px solid #e2e8f0",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  loadingText: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
    fontWeight: 500,
  },

  heroCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    gap: 16,
    flexWrap: "wrap",
    padding: "1.4rem 1.5rem",
    borderRadius: 24,
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "#fff",
    boxShadow: "0 18px 40px -24px rgba(37,99,235,0.45)",
  },

  heroEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.18)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 700,
    color: "#fff",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    maxWidth: 560,
  },

  heroStats: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  statCard: {
    background: "rgba(255,255,255,0.16)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.24)",
    borderRadius: 16,
    padding: "10px 12px",
    minWidth: 110,
  },

  statLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.77)",
  },

  statValue: {
    display: "block",
    marginTop: 4,
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
  },

  toolbar: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: "1rem",
    padding: "1rem",
    borderRadius: 18,
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 24px -18px rgba(15,23,42,0.24)",
  },

  searchBox: {
    position: "relative",
    flex: 1,
    minWidth: 240,
  },

  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    fontSize: 15,
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    height: 44,
    padding: "0 14px 0 36px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    outline: "none",
    background: "#fff",
    fontSize: 14,
    color: "#334155",
    boxSizing: "border-box",
  },

  select: {
    height: 44,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "#fff",
    outline: "none",
    fontSize: 14,
    color: "#334155",
    cursor: "pointer",
  },

  summaryRow: {
    marginBottom: "1.25rem",
  },

  summaryText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(320px,1fr))",
    gap: 24,
  },

  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 22,
    padding: "1.4rem",
    cursor: "pointer",
    transition: "0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 12px 30px -20px rgba(15,23,42,0.24)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 20,
    flexShrink: 0,
  },

  hallName: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
  },

  location: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 500,
  },

  status: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    marginTop: 8,
  },

  description: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.6,
    minHeight: 48,
  },

  infoRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  infoCard: {
    background: "#f8fafc",
    borderRadius: 14,
    padding: "1rem",
  },

  infoLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
  },

  infoValue: {
    margin: "8px 0 0",
    color: "#0f172a",
    fontSize: 20,
    fontWeight: 700,
  },

  facilitiesWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  facility: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },

  moreFacility: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },

  viewBtn: {
    marginTop: "auto",
    height: 46,
    borderRadius: 12,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },

  emptyState: {
    padding: "5rem 2rem",
    textAlign: "center",
    color: "#94a3b8",
  },

  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: "#0f172a",
  },

  emptyText: {
    margin: 0,
    fontSize: 14,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },

  modal: {
    width: "100%",
    maxWidth: 560,
    background: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    animation: "fadeUp 0.2s ease",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "1.5rem",
    borderBottom: "1px solid #f1f5f9",
  },

  modalTop: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },

  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
  },

  modalTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "#0f172a",
  },

  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 700,
  },

  modalBody: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  modalLabel: {
    margin: "0 0 10px",
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  modalDescription: {
    margin: 0,
    color: "#334155",
    lineHeight: 1.7,
    fontSize: 15,
  },

  capacityCard: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "14px 18px",
    borderRadius: 14,
    fontWeight: 700,
    display: "inline-block",
  },

  modalFacilities: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  modalFacility: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
  },

  noFacilities: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 14,
  },
};

export default ViewHalls;