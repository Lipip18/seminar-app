import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { AuthContext } from "../../context/AuthContext";

const ViewHalls = () => {
  const { api } = useContext(AuthContext);

  const navigate = useNavigate();

  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [capacityFilter, setCapacityFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedHall, setSelectedHall] =
    useState(null);

  /* ───────────────── FETCH HALLS ───────────────── */

  useEffect(() => {
    fetchHalls();
  }, [api]);

  const fetchHalls = async () => {
    try {
      setLoading(true);

      const res = await api.get("/halls");

      console.log(
        "HALLS RESPONSE:",
        res.data
      );

      const hallsData =
        res.data?.data || [];

      setHalls(hallsData);
    } catch (err) {
      console.error(
        "FETCH HALLS ERROR:",
        err
      );

      toast.error(
        err?.response?.data
          ?.message ||
          "Failed to load halls"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── FILTERING ───────────────── */

  const filteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      const q =
        search.toLowerCase();

      const matchesSearch =
        !q ||
        hall.name
          ?.toLowerCase()
          .includes(q) ||
        hall.location?.building
          ?.toLowerCase()
          .includes(q);

      const matchesCapacity =
        capacityFilter ===
          "all" ||
        (capacityFilter ===
          "small" &&
          hall.capacity <= 50) ||
        (capacityFilter ===
          "medium" &&
          hall.capacity > 50 &&
          hall.capacity <= 150) ||
        (capacityFilter ===
          "large" &&
          hall.capacity > 150);

      const matchesStatus =
        statusFilter ===
          "all" ||
        (statusFilter ===
          "active" &&
          hall.isActive !== false) ||
        (statusFilter ===
          "inactive" &&
          hall.isActive === false);

      return (
        matchesSearch &&
        matchesCapacity &&
        matchesStatus
      );
    });
  }, [
    halls,
    search,
    capacityFilter,
    statusFilter,
  ]);

  /* ───────────────── BOOK HALL ───────────────── */

  const handleBookHall = (
    hallId
  ) => {
    navigate(
      `/faculty/book-hall/${hallId}`
    );
  };

  /* ───────────────── LOADING ───────────────── */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
          background: "#f8fafc",
          flexDirection:
            "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border:
              "4px solid #e2e8f0",
            borderTopColor:
              "#2563eb",
            borderRadius:
              "50%",
            animation:
              "spin 0.8s linear infinite",
          }}
        />

        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: 14,
          }}
        >
          Loading halls...
        </p>

        <style>
          {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "2rem",
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          marginBottom:
            "2rem",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Available Seminar
            Halls
          </h1>

          <p
            style={{
              marginTop: 6,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            View seminar halls
            added by
            administration
          </p>
        </div>

        <button
          onClick={fetchHalls}
          style={{
            height: 42,
            padding:
              "0 18px",
            borderRadius: 10,
            border:
              "1px solid #cbd5e1",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          Refresh
        </button>
      </div>

      {/* FILTERS */}

      <div
        style={{
          background: "#fff",
          border:
            "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "1rem",
          marginBottom:
            "1.5rem",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search hall or building..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            flex: 1,
            minWidth: 220,
            height: 42,
            padding:
              "0 14px",
            borderRadius: 10,
            border:
              "1px solid #cbd5e1",
            outline: "none",
            fontSize: 14,
            background: "#fff",
          }}
        />

        {/* CAPACITY */}

        <select
          value={
            capacityFilter
          }
          onChange={(e) =>
            setCapacityFilter(
              e.target.value
            )
          }
          style={{
            height: 42,
            padding:
              "0 14px",
            borderRadius: 10,
            border:
              "1px solid #cbd5e1",
            background: "#fff",
            outline: "none",
          }}
        >
          <option value="all">
            All Capacities
          </option>

          <option value="small">
            Small (≤ 50)
          </option>

          <option value="medium">
            Medium (51 - 150)
          </option>

          <option value="large">
            Large (150+)
          </option>
        </select>

        {/* STATUS */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          style={{
            height: 42,
            padding:
              "0 14px",
            borderRadius: 10,
            border:
              "1px solid #cbd5e1",
            background: "#fff",
            outline: "none",
          }}
        >
          <option value="all">
            All Status
          </option>

          <option value="active">
            Available
          </option>

          <option value="inactive">
            Unavailable
          </option>
        </select>
      </div>

      {/* HALLS GRID */}

      {filteredHalls.length ===
      0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            border:
              "1px solid #e2e8f0",
            padding:
              "4rem 2rem",
            textAlign:
              "center",
          }}
        >
          <div
            style={{
              fontSize: 52,
              marginBottom: 14,
            }}
          >
            🏛
          </div>

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
            }}
          >
            No halls found
          </h2>

          <p
            style={{
              marginTop: 8,
              color: "#64748b",
            }}
          >
            Try changing
            search or
            filters
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(320px,1fr))",
            gap: 22,
          }}
        >
          {filteredHalls.map(
            (hall) => (
              <div
                key={hall._id}
                style={{
                  background:
                    "#fff",
                  borderRadius: 18,
                  overflow:
                    "hidden",
                  border:
                    "1px solid #e2e8f0",
                  transition:
                    "0.2s ease",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* BANNER */}

                <div
                  style={{
                    height: 190,
                    background:
                      "linear-gradient(135deg,#2563eb,#7c3aed)",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    color: "#fff",
                    fontSize: 60,
                    fontWeight: 700,
                  }}
                >
                  🏛
                </div>

                {/* CONTENT */}

                <div
                  style={{
                    padding:
                      "1.4rem",
                  }}
                >
                  {/* TITLE */}

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 22,
                          color:
                            "#0f172a",
                          fontWeight: 700,
                        }}
                      >
                        {
                          hall.name
                        }
                      </h2>

                      <p
                        style={{
                          marginTop: 5,
                          color:
                            "#64748b",
                          fontSize: 13,
                        }}
                      >
                        {hall
                          .location
                          ?.building ||
                          "Campus Building"}
                      </p>
                    </div>

                    <span
                      style={{
                        padding:
                          "5px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          hall.isActive !==
                            false &&
                          hall.status !==
                            "Booked" &&
                          hall.status !==
                            "Unavailable"
                            ? "#f0fdf4"
                            : "#fef2f2",
                        color:
                          hall.isActive !==
                            false &&
                          hall.status !==
                            "Booked" &&
                          hall.status !==
                            "Unavailable"
                            ? "#15803d"
                            : "#b91c1c",
                      }}
                    >
                      {hall.isActive !==
                        false &&
                      hall.status !==
                        "Booked" &&
                      hall.status !==
                        "Unavailable"
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>

                  {/* DESCRIPTION */}

                  <p
                    style={{
                      color:
                        "#64748b",
                      fontSize: 14,
                      lineHeight: 1.7,
                      minHeight: 60,
                    }}
                  >
                    {hall.description ||
                      "Seminar hall available for workshops, academic events and presentations."}
                  </p>

                  {/* DETAILS */}

                  <div
                    style={{
                      marginTop: 18,
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        background:
                          "#f8fafc",
                        borderRadius: 12,
                        padding:
                          "1rem",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color:
                            "#64748b",
                        }}
                      >
                        Seating
                        Capacity
                      </p>

                      <h3
                        style={{
                          margin:
                            "6px 0 0",
                          color:
                            "#0f172a",
                        }}
                      >
                        {hall.capacity ||
                          0}
                      </h3>
                    </div>

                    <div
                      style={{
                        background:
                          "#f8fafc",
                        borderRadius: 12,
                        padding:
                          "1rem",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color:
                            "#64748b",
                        }}
                      >
                        Facilities
                      </p>

                      <h3
                        style={{
                          margin:
                            "6px 0 0",
                          color:
                            "#0f172a",
                          fontSize: 15,
                        }}
                      >
                        {hall
                          .facilities
                          ?.length ||
                          0}{" "}
                        Items
                      </h3>
                    </div>
                  </div>

                  {/* FACILITIES */}

                  {hall
                    .facilities
                    ?.length >
                    0 && (
                    <div
                      style={{
                        marginTop: 18,
                      }}
                    >
                      <p
                        style={{
                          marginBottom: 10,
                          fontSize: 13,
                          fontWeight: 600,
                          color:
                            "#475569",
                        }}
                      >
                        Available
                        Facilities
                      </p>

                      <div
                        style={{
                          display:
                            "flex",
                          flexWrap:
                            "wrap",
                          gap: 8,
                        }}
                      >
                        {hall.facilities.map(
                          (
                            facility,
                            i
                          ) => (
                            <span
                              key={
                                i
                              }
                              style={{
                                padding:
                                  "6px 10px",
                                borderRadius: 999,
                                background:
                                  "#eff6ff",
                                color:
                                  "#2563eb",
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              {
                                facility
                              }
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* FOOTER */}

                  <div
                    style={{
                      marginTop: 24,
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: 12,
                    }}
                  >
                    {/* STATUS */}

                    {hall.isActive ===
                      false ||
                    hall.status ===
                      "Booked" ||
                    hall.status ===
                      "Unavailable" ? (
                      <div
                        style={{
                          padding:
                            "10px 14px",
                          borderRadius: 10,
                          background:
                            "#fef2f2",
                          color:
                            "#b91c1c",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Hall is
                        currently
                        unavailable
                        for booking
                      </div>
                    ) : (
                      <div
                        style={{
                          padding:
                            "10px 14px",
                          borderRadius: 10,
                          background:
                            "#f0fdf4",
                          color:
                            "#15803d",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Hall is
                        available
                        for booking
                      </div>
                    )}

                    {/* BUTTONS */}

                    <div
                      style={{
                        display:
                          "flex",
                        gap: 12,
                      }}
                    >
                      {/* VIEW */}

                      <button
                        onClick={() =>
                          setSelectedHall(
                            hall
                          )
                        }
                        style={{
                          flex: 1,
                          height: 42,
                          borderRadius: 10,
                          border:
                            "none",
                          background:
                            "#0f172a",
                          color:
                            "#fff",
                          fontWeight: 600,
                          cursor:
                            "pointer",
                        }}
                      >
                        View
                        Details
                      </button>

                      {/* BOOK */}

                      {hall.isActive !==
                        false &&
                        hall.status !==
                          "Booked" &&
                        hall.status !==
                          "Unavailable" && (
                          <button
                            onClick={() =>
                              handleBookHall(
                                hall._id
                              )
                            }
                            style={{
                              flex: 1,
                              height: 42,
                              borderRadius: 10,
                              border:
                                "none",
                              background:
                                "#2563eb",
                              color:
                                "#fff",
                              fontWeight: 600,
                              cursor:
                                "pointer",
                            }}
                          >
                            Book
                            Hall
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* MODAL */}

      {selectedHall && (
        <div
          onClick={() =>
            setSelectedHall(
              null
            )
          }
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: 600,
              background:
                "#fff",
              borderRadius: 20,
              overflow:
                "hidden",
            }}
          >
            {/* HEADER */}

            <div
              style={{
                height: 220,
                background:
                  "linear-gradient(135deg,#2563eb,#7c3aed)",
                display:
                  "flex",
                justifyContent:
                  "center",
                alignItems:
                  "center",
                fontSize: 72,
                color: "#fff",
              }}
            >
              🏛
            </div>

            {/* CONTENT */}

            <div
              style={{
                padding:
                  "2rem",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  color:
                    "#0f172a",
                }}
              >
                {
                  selectedHall.name
                }
              </h2>

              <p
                style={{
                  color:
                    "#64748b",
                  marginTop: 6,
                }}
              >
                {selectedHall
                  .location
                  ?.building ||
                  "Campus Building"}
              </p>

              <p
                style={{
                  marginTop: 20,
                  lineHeight: 1.8,
                  color:
                    "#475569",
                }}
              >
                {
                  selectedHall.description
                }
              </p>

              {/* FACILITIES */}

              <div
                style={{
                  marginTop: 24,
                }}
              >
                <h4
                  style={{
                    marginBottom: 12,
                  }}
                >
                  Facilities
                </h4>

                <div
                  style={{
                    display:
                      "flex",
                    flexWrap:
                      "wrap",
                    gap: 10,
                  }}
                >
                  {selectedHall.facilities?.map(
                    (
                      facility,
                      index
                    ) => (
                      <span
                        key={
                          index
                        }
                        style={{
                          padding:
                            "8px 12px",
                          borderRadius: 999,
                          background:
                            "#eff6ff",
                          color:
                            "#2563eb",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {
                          facility
                        }
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* CAPACITY */}

              <div
                style={{
                  marginTop: 24,
                  fontWeight: 600,
                  color:
                    "#0f172a",
                }}
              >
                Capacity:{" "}
                {
                  selectedHall.capacity
                }
              </div>

              {/* CLOSE */}

              <button
                onClick={() =>
                  setSelectedHall(
                    null
                  )
                }
                style={{
                  marginTop: 30,
                  width: "100%",
                  height: 46,
                  border:
                    "none",
                  borderRadius: 12,
                  background:
                    "#0f172a",
                  color: "#fff",
                  fontWeight: 600,
                  cursor:
                    "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewHalls;