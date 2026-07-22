import axios from "axios";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Calendar as BigCalendar,
    momentLocalizer,
    Views,
} from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const STATUS_COLORS = {
  confirmed: {
    bg: "#f0fdf4",
    border: "#16a34a",
    text: "#15803d",
    dot: "#16a34a",
  },

  pending: {
    bg: "#fffbeb",
    border: "#d97706",
    text: "#b45309",
    dot: "#d97706",
  },

  cancelled: {
    bg: "#fef2f2",
    border: "#dc2626",
    text: "#b91c1c",
    dot: "#dc2626",
  },

  default: {
    bg: "#eff6ff",
    border: "#2563eb",
    text: "#1d4ed8",
    dot: "#2563eb",
  },
};

const HALL_PALETTE = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#16a34a",
  "#0891b2",
  "#ca8a04",
  "#9333ea",
];

const hallColorMap = {};
let hallColorIdx = 0;

const getHallColor = (hallName) => {
  if (!hallColorMap[hallName]) {
    hallColorMap[hallName] =
      HALL_PALETTE[
        hallColorIdx %
          HALL_PALETTE.length
      ];

    hallColorIdx++;
  }

  return hallColorMap[hallName];
};

const getBookingHall = (booking) =>
  booking?.hall?.name ||
  booking?.hallId?.name ||
  booking?.hallName ||
  "Seminar Hall";

const getBookingUser = (booking) =>
  booking?.user?.name ||
  booking?.userId?.name ||
  booking?.bookedBy ||
  "User";

const getBookingPurpose = (booking) =>
  booking?.purpose ||
  "No purpose provided";

const getBookingLocation = (booking) =>
  booking?.hall?.location?.building ||
  booking?.hallId?.location?.building ||
  booking?.location?.building ||
  "Main campus";

const Calendar = () => {
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [view, setView] =
    useState(Views.MONTH);

  const [date, setDate] =
    useState(new Date());

  const [
    selectedEvent,
    setSelectedEvent,
  ] = useState(null);

  const [filterHall, setFilterHall] =
    useState("all");

  const [
    filterStatus,
    setFilterStatus,
  ] = useState("all");

  const [search, setSearch] =
    useState("");

  const token =
    localStorage.getItem("token");

  /* ───────────────── FETCH BOOKINGS ───────────────── */

  const fetchBookings =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const res =
          await axios.get(
            "http://localhost:5000/api/bookings",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const bookings =
          res.data?.data || [];

        const formatted =
          bookings.map(
            (booking) => {
              const hall =
                booking.hall ||
                booking.hallId ||
                {};

              const user =
                booking.user ||
                booking.userId ||
                {};

              return {
                id: booking._id,

                title: `${
                  hall.name ||
                  "Hall"
                } — ${
                  user.name ||
                  "User"
                }`,

                start: new Date(
                  `${moment(
                    booking.date
                  ).format(
                    "YYYY-MM-DD"
                  )}T${
                    booking.startTime
                  }`
                ),

                end: new Date(
                  `${moment(
                    booking.date
                  ).format(
                    "YYYY-MM-DD"
                  )}T${
                    booking.endTime
                  }`
                ),

                hall:
                  hall.name ||
                  "Hall",

                user:
                  user.name ||
                  "User",

                userEmail:
                  user.email ||
                  "",

                status:
                  booking.status ||
                  "confirmed",

                purpose:
                  booking.purpose ||
                  "",

                capacity:
                  hall.capacity ||
                  null,

                rawDate:
                  booking.date,

                startTime:
                  booking.startTime,

                endTime:
                  booking.endTime,
              };
            }
          );

        setEvents(formatted);
      } catch (err) {
        console.error(
          "Calendar error:",
          err
        );

        setError(
          "Failed to load bookings"
        );
      } finally {
        setLoading(false);
      }
    }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ───────────────── FILTERS ───────────────── */

  const halls = useMemo(() => {
    return [
      "all",
      ...Array.from(
        new Set(
          events.map(
            (e) => e.hall
          )
        )
      ),
    ];
  }, [events]);

  const filteredEvents =
    useMemo(() => {
      return events.filter(
        (e) => {
          const matchHall =
            filterHall ===
              "all" ||
            e.hall ===
              filterHall;

          const matchStatus =
            filterStatus ===
              "all" ||
            e.status ===
              filterStatus;

          const matchSearch =
            !search ||
            e.hall
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            e.user
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          return (
            matchHall &&
            matchStatus &&
            matchSearch
          );
        }
      );
    }, [
      events,
      filterHall,
      filterStatus,
      search,
    ]);

  /* ───────────────── STATS ───────────────── */

  const stats = useMemo(() => {
    const today =
      moment().format(
        "YYYY-MM-DD"
      );

    const todayEvents =
      events.filter(
        (e) =>
          moment(
            e.rawDate
          ).format(
            "YYYY-MM-DD"
          ) === today
      );

    const thisMonth =
      events.filter(
        (e) =>
          moment(
            e.rawDate
          ).month() ===
          moment().month()
      );

    return {
      total: events.length,

      today:
        todayEvents.length,

      thisMonth:
        thisMonth.length,

      confirmed:
        events.filter(
          (e) =>
            e.status ===
            "confirmed"
        ).length,
    };
  }, [events]);

  /* ───────────────── EVENT STYLE ───────────────── */

  const eventStyleGetter = (
    event
  ) => {
    const color =
      getHallColor(
        event.hall
      );

    return {
      style: {
        backgroundColor:
          color + "22",

        border: `1px solid ${color}`,

        color: color,

        borderRadius: 6,

        fontSize: 12,

        fontWeight: 500,

        padding: "2px 6px",
      },
    };
  };

  const handleNavigate = (
    newDate
  ) => setDate(newDate);

  const handleViewChange = (
    newView
  ) => setView(newView);

  const closeModal = () =>
    setSelectedEvent(null);

  const statusCfg = (
    status
  ) =>
    STATUS_COLORS[
      status
    ] ||
    STATUS_COLORS.default;

  return (
    <div style={s.page}>
      {/* HEADER */}

      <div style={s.header}>
        <div>
          <h1 style={s.title}>
            Calendar
          </h1>

          <p style={s.subtitle}>
            View all seminar hall
            bookings and schedules
          </p>
        </div>

        <button
          onClick={
            fetchBookings
          }
          style={s.refreshBtn}
        >
          Refresh
        </button>
      </div>

      {/* STATS */}

      <div style={s.statsRow}>
        {[
          {
            label:
              "Total bookings",

            value:
              stats.total,

            color:
              "#2563eb",
          },

          {
            label: "Today",

            value:
              stats.today,

            color:
              "#7c3aed",
          },

          {
            label:
              "This month",

            value:
              stats.thisMonth,

            color:
              "#0891b2",
          },

          {
            label:
              "Confirmed",

            value:
              stats.confirmed,

            color:
              "#16a34a",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={s.statCard}
          >
            <p style={s.statLabel}>
              {stat.label}
            </p>

            <p
              style={{
                ...s.statValue,
                color:
                  stat.color,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* FILTERS */}

      <div style={s.filtersRow}>
        <div
          style={s.searchWrap}
        >
          <input
            type="text"
            placeholder="Search hall or user..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={s.searchInput}
          />
        </div>

        <select
          value={filterHall}
          onChange={(e) =>
            setFilterHall(
              e.target.value
            )
          }
          style={s.select}
        >
          {halls.map((h) => (
            <option
              key={h}
              value={h}
            >
              {h === "all"
                ? "All halls"
                : h}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value
            )
          }
          style={s.select}
        >
          <option value="all">
            All statuses
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>

        <span
          style={s.resultCount}
        >
          {
            filteredEvents.length
          }{" "}
          bookings
        </span>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={
            s.errorBanner
          }
        >
          {error}
        </div>
      )}

      {/* CALENDAR */}

      <div style={s.calCard}>
        {loading ? (
          <div
            style={
              s.loadingWrap
            }
          >
            <div
              style={
                s.spinner
              }
            />

            <p
              style={
                s.loadingText
              }
            >
              Loading
              bookings...
            </p>
          </div>
        ) : (
          <BigCalendar
            localizer={
              localizer
            }
            events={
              filteredEvents
            }
            startAccessor="start"
            endAccessor="end"
            view={view}
            date={date}
            onNavigate={
              handleNavigate
            }
            onView={
              handleViewChange
            }
            onSelectEvent={(
              event
            ) =>
              setSelectedEvent(
                event
              )
            }
            eventPropGetter={
              eventStyleGetter
            }
            style={{
              height: 700,
            }}
            views={[
              Views.MONTH,
              Views.WEEK,
              Views.DAY,
              Views.AGENDA,
            ]}
            popup
          />
        )}
      </div>

      {/* LEGEND */}

      {!loading &&
        halls.filter(
          (h) =>
            h !== "all"
        ).length >
          0 && (
          <div
            style={
              s.legend
            }
          >
            {halls
              .filter(
                (h) =>
                  h !==
                  "all"
              )
              .map(
                (hall) => (
                  <div
                    key={
                      hall
                    }
                    style={
                      s.legendItem
                    }
                  >
                    <div
                      style={{
                        ...s.legendDot,
                        background:
                          getHallColor(
                            hall
                          ),
                      }}
                    />

                    <span
                      style={
                        s.legendLabel
                      }
                    >
                      {hall}
                    </span>
                  </div>
                )
              )}
          </div>
        )}

      {/* EVENT MODAL */}

      {selectedEvent && (
        <div
          style={
            s.modalOverlay
          }
          onClick={
            closeModal
          }
        >
          <div
            style={s.modal}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              style={
                s.modalHeader
              }
            >
              <div>
                <h2
                  style={
                    s.modalTitle
                  }
                >
                  {
                    selectedEvent.hall
                  }
                </h2>

                <span
                  style={{
                    ...s.statusBadge,
                    background:
                      statusCfg(
                        selectedEvent.status
                      ).bg,

                    border: `1px solid ${
                      statusCfg(
                        selectedEvent.status
                      ).border
                    }`,

                    color:
                      statusCfg(
                        selectedEvent.status
                      ).text,
                  }}
                >
                  {
                    selectedEvent.status
                  }
                </span>
              </div>

              <button
                onClick={
                  closeModal
                }
                style={
                  s.closeBtn
                }
              >
                ✕
              </button>
            </div>

            <div
              style={
                s.modalBody
              }
            >
              <div>
                <p
                  style={
                    s.modalRowLabel
                  }
                >
                  Booked By
                </p>

                <p
                  style={
                    s.modalRowValue
                  }
                >
                  {
                    selectedEvent.user
                  }
                </p>
              </div>

              <div>
                <p
                  style={
                    s.modalRowLabel
                  }
                >
                  Date
                </p>

                <p
                  style={
                    s.modalRowValue
                  }
                >
                  {moment(
                    selectedEvent.rawDate
                  ).format(
                    "dddd, MMMM D YYYY"
                  )}
                </p>
              </div>

              <div>
                <p
                  style={
                    s.modalRowLabel
                  }
                >
                  Time
                </p>

                <p
                  style={
                    s.modalRowValue
                  }
                >
                  {
                    selectedEvent.startTime
                  }{" "}
                  -{" "}
                  {
                    selectedEvent.endTime
                  }
                </p>
              </div>

              {selectedEvent.purpose && (
                <div>
                  <p
                    style={
                      s.modalRowLabel
                    }
                  >
                    Purpose
                  </p>

                  <p
                    style={
                      s.modalRowValue
                    }
                  >
                    {
                      selectedEvent.purpose
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR STYLES */}

      <style>{`
        .rbc-calendar {
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .rbc-toolbar {
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .rbc-toolbar button {
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          padding: 6px 14px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
        }

        .rbc-toolbar button:hover {
          background: #f1f5f9;
        }

        .rbc-toolbar button.rbc-active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .rbc-toolbar-label {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .rbc-header {
          padding: 10px;
          font-size: 13px;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        .rbc-today {
          background: #eff6ff !important;
        }

        .rbc-off-range-bg {
          background: #f8fafc;
        }

        .rbc-event {
          cursor: pointer;
        }

        .rbc-event:hover {
          opacity: 0.85;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const s = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "2rem",
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: 12,
  },

  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 800,
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 6,
    color: "#64748b",
    fontSize: 14,
  },

  refreshBtn: {
    height: 42,
    padding: "0 18px",
    borderRadius: 10,
    border:
      "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    color: "#0f172a",
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: 16,
    marginBottom: "1.5rem",
  },

  statCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: 16,
    padding: "1.2rem",
  },

  statLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
  },

  statValue: {
    margin:
      "10px 0 0",
    fontSize: 28,
    fontWeight: 800,
  },

  filtersRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: "1rem",
  },

  searchWrap: {
    flex: 1,
    minWidth: 220,
  },

  searchInput: {
    width: "100%",
    height: 42,
    padding: "0 14px",
    borderRadius: 10,
    border:
      "1px solid #cbd5e1",
    outline: "none",
    fontSize: 14,
    background: "#fff",
  },

  select: {
    height: 42,
    padding: "0 14px",
    borderRadius: 10,
    border:
      "1px solid #cbd5e1",
    background: "#fff",
    outline: "none",
  },

  resultCount: {
    fontSize: 13,
    color: "#64748b",
    display: "flex",
    alignItems: "center",
  },

  errorBanner: {
    padding: "12px 16px",
    background: "#fef2f2",
    border:
      "1px solid #fca5a5",
    borderRadius: 10,
    color: "#b91c1c",
    marginBottom: "1rem",
  },

  calCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: 18,
    padding: "1.5rem",
    overflow: "hidden",
  },

  loadingWrap: {
    height: 500,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },

  spinner: {
    width: 40,
    height: 40,
    border:
      "4px solid #e2e8f0",
    borderTopColor:
      "#2563eb",
    borderRadius: "50%",
    animation:
      "spin 0.8s linear infinite",
  },

  loadingText: {
    margin: 0,
    color: "#64748b",
  },

  legend: {
    marginTop: "1rem",
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "1rem",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },

  legendLabel: {
    fontSize: 13,
    color: "#475569",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },

  modal: {
    background: "#fff",
    borderRadius: 18,
    width: "100%",
    maxWidth: 420,
    overflow: "hidden",
    animation:
      "fadeUp 0.2s ease",
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
    padding: "1.5rem",
    borderBottom:
      "1px solid #f1f5f9",
  },

  modalTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
  },

  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border:
      "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
  },

  modalBody: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  modalRowLabel: {
    margin: 0,
    fontSize: 12,
    color: "#94a3b8",
    textTransform:
      "uppercase",
    fontWeight: 700,
  },

  modalRowValue: {
    margin:
      "6px 0 0",
    color: "#0f172a",
    fontWeight: 600,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding:
      "5px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    marginTop: 10,
  },
};

export default Calendar;
