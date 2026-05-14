import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

const ViewHalls = () => {
  const { api } = useContext(AuthContext);

  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState(null);

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

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading halls...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Seminar Halls</h1>
          <p style={styles.subtitle}>
            Browse all available seminar halls and their facilities
          </p>
        </div>

        <div style={styles.countBadge}>
          {halls.length} Halls
        </div>
      </div>

      {/* HALL GRID */}
      <div style={styles.grid}>
        {halls.map((hall) => (
          <div
            key={hall._id}
            style={styles.card}
            onClick={() => setSelectedHall(hall)}
          >
            {/* TOP */}
            <div style={styles.cardTop}>
              <div style={styles.avatar}>
                {getInitials(hall.name)}
              </div>

              <div>
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
            </div>

            {/* DESCRIPTION */}
            <p style={styles.description}>
              {hall.description ||
                "No description available"}
            </p>

            {/* DETAILS */}
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

            {/* FACILITIES */}
            {hall.facilities?.length > 0 && (
              <div style={styles.facilitiesWrap}>
                {hall.facilities
                  .slice(0, 4)
                  .map((facility, index) => (
                    <span
                      key={index}
                      style={styles.facility}
                    >
                      {facility}
                    </span>
                  ))}

                {hall.facilities.length > 4 && (
                  <span style={styles.moreFacility}>
                    +{hall.facilities.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* BUTTON */}
            <button style={styles.viewBtn}>
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {!loading && halls.length === 0 && (
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
            No halls available
          </h3>

          <p style={styles.emptyText}>
            There are currently no seminar halls
            added to the system.
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
                  {selectedHall.facilities?.length >
                  0 ? (
                    selectedHall.facilities.map(
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

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    gap: 12,
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 700,
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748b",
  },

  countBadge: {
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    padding: "10px 16px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
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
    borderRadius: 20,
    padding: "1.5rem",
    cursor: "pointer",
    transition: "0.2s",
    display: "flex",
    flexDirection: "column",
    gap: 18,
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