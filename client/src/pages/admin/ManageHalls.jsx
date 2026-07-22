import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/halls`;
const AMENITIES_LIST = [
  "Projector", "Whiteboard", "Air Conditioning", "Microphone",
  "Sound System", "WiFi", "Podium", "Video Conferencing",
];
const EMPTY_FORM = {
  name: "", capacity: "", building: "", floor: "", roomNumber: "",
  description: "", status: "Available", amenities: [], isActive: true,
};

const token = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

/* ─── tiny helpers ─────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const ok = status === "Available";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
      background: ok ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${ok ? "#86efac" : "#fca5a5"}`,
      color: ok ? "#15803d" : "#b91c1c",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: ok ? "#16a34a" : "#dc2626" }} />
      {status}
    </span>
  );
};

const ActiveBadge = ({ isActive }) => (
  <span style={{
    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
    background: isActive ? "#eff6ff" : "#f8fafc",
    border: `1px solid ${isActive ? "#93c5fd" : "#e2e8f0"}`,
    color: isActive ? "#1d4ed8" : "#94a3b8",
  }}>
    {isActive ? "Active" : "Inactive"}
  </span>
);

const Toast = ({ toast }) => {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px", borderRadius: 10,
      background: ok ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${ok ? "#86efac" : "#fca5a5"}`,
      color: ok ? "#15803d" : "#b91c1c",
      fontSize: 14, fontWeight: 500,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    }}>
      {ok ? "✓" : "✕"} {toast.message}
    </div>
  );
};

/* ─── Modal ─────────────────────────────────────────────────── */
const HallModal = ({ mode, hall, onClose, onSave }) => {
  const [form, setForm] = useState(
    mode === "add"
      ? EMPTY_FORM
      : {
        name: hall.name || "",
        capacity: hall.capacity || "",
        building: hall.location?.building || "",
        floor: hall.location?.floor || "",
        roomNumber: hall.location?.roomNumber || "",
        description: hall.description || "",
        status: hall.status || "Available",
        amenities: hall.facilities || hall.amenities || [],
        isActive: hall.isActive ?? true,
      }
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isView = mode === "view";

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Hall name is required";
    if (form.name.length > 50) e.name = "Max 50 characters";
    if (!form.capacity) e.capacity = "Capacity is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (form.description.length > 500) e.description = "Max 500 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      capacity: Number(form.capacity),
      location: { building: form.building, floor: form.floor, roomNumber: form.roomNumber },
      description: form.description.trim(),
      status: form.status,
      facilities: form.amenities,
      amenities: form.amenities,
      isActive: form.isActive,
    };
    await onSave(payload, hall?._id);
    setSaving(false);
  };

  const inputStyle = (err) => ({
    width: "100%", height: 38, padding: "0 12px", fontSize: 14,
    border: `1px solid ${err ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 8,
    background: isView ? "#f8fafc" : "#fff", color: "#0f172a",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  });

  const labelStyle = { fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 5, display: "block" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "1rem",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto",
        animation: "fadeUp 0.2s ease",
      }} onClick={(e) => e.stopPropagation()}>

        {/* Modal header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
              {mode === "add" ? "Add new hall" : mode === "edit" ? "Edit hall" : "Hall details"}
            </h2>
            {mode === "view" && hall && (
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b" }}>{hall.name}</p>
            )}
          </div>
          <button onClick={onClose} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0",
            background: "transparent", color: "#64748b", cursor: "pointer",
          }}>✕</button>
        </div>

        {/* Modal body */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Hall name <span style={{ color: "#ef4444" }}>*</span></label>
            <input name="name" value={form.name} onChange={handleChange}
              disabled={isView} placeholder="e.g. Conference Hall A"
              style={inputStyle(errors.name)} maxLength={50} />
            {errors.name && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.name}</p>}
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>{form.name.length}/50</p>
          </div>

          {/* Capacity */}
          <div>
            <label style={labelStyle}>Capacity <span style={{ color: "#ef4444" }}>*</span></label>
            <input name="capacity" type="number" value={form.capacity} onChange={handleChange}
              disabled={isView} placeholder="e.g. 50"
              style={inputStyle(errors.capacity)} min={1} />
            {errors.capacity && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.capacity}</p>}
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Location</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <input name="building" value={form.building} onChange={handleChange}
                disabled={isView} placeholder="Building"
                style={{ ...inputStyle(), fontSize: 13 }} />
              <input name="floor" value={form.floor} onChange={handleChange}
                disabled={isView} placeholder="Floor"
                style={{ ...inputStyle(), fontSize: 13 }} />
              <input name="roomNumber" value={form.roomNumber} onChange={handleChange}
                disabled={isView} placeholder="Room No."
                style={{ ...inputStyle(), fontSize: 13 }} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange}
              disabled={isView} placeholder="Brief description of the hall…"
              maxLength={500}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 14,
                border: `1px solid ${errors.description ? "#fca5a5" : "#e2e8f0"}`,
                borderRadius: 8, background: isView ? "#f8fafc" : "#fff",
                color: "#0f172a", outline: "none", resize: "vertical",
                minHeight: 80, fontFamily: "inherit", boxSizing: "border-box",
              }} />
            {errors.description && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{errors.description}</p>}
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>{form.description.length}/500</p>
          </div>

          {/* Status + isActive */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                disabled={isView}
                style={{ ...inputStyle(), cursor: isView ? "not-allowed" : "pointer" }}>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={labelStyle}>Active</label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: isView ? "default" : "pointer" }}>
                <input type="checkbox" name="isActive" checked={form.isActive}
                  onChange={handleChange} disabled={isView}
                  style={{ width: 16, height: 16, accentColor: "#2563eb" }} />
                <span style={{ fontSize: 14, color: "#374151" }}>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label style={labelStyle}>Amenities</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {AMENITIES_LIST.map((a) => {
                const selected = form.amenities.includes(a);
                return (
                  <button key={a} type="button"
                    onClick={() => !isView && toggleAmenity(a)}
                    style={{
                      padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500,
                      cursor: isView ? "default" : "pointer",
                      border: `1px solid ${selected ? "#93c5fd" : "#e2e8f0"}`,
                      background: selected ? "#eff6ff" : "#f8fafc",
                      color: selected ? "#1d4ed8" : "#64748b",
                      transition: "all 0.15s",
                    }}>
                    {selected ? "✓ " : ""}{a}
                  </button>
                );
              })}
            </div>
          </div>

          {/* View mode: extra info */}
          {isView && hall && (
            <div style={{
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 10, padding: "1rem",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Total bookings</p>
                <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{hall.bookings?.length ?? 0}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Created</p>
                <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 500, color: "#374151" }}>
                  {hall.createdAt ? new Date(hall.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        {!isView && (
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 10,
            padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9",
          }}>
            <button onClick={onClose} style={{
              height: 38, padding: "0 18px", borderRadius: 8,
              border: "1px solid #e2e8f0", background: "transparent",
              color: "#64748b", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving} style={{
              height: 38, padding: "0 20px", borderRadius: 8,
              border: "none", background: saving ? "#93c5fd" : "#2563eb",
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>
              {saving ? "Saving…" : mode === "add" ? "Add hall" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Delete confirm modal ──────────────────────────────────── */
const DeleteModal = ({ hall, onClose, onConfirm, loading }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  }} onClick={onClose}>
    <div style={{
      background: "#fff", borderRadius: 16, width: "100%", maxWidth: 380,
      padding: "1.5rem", animation: "fadeUp 0.2s ease",
    }} onClick={(e) => e.stopPropagation()}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "#fef2f2", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 22, marginBottom: 12,
      }}>🗑</div>
      <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Delete hall?</h2>
      <p style={{ margin: "0 0 1.5rem", fontSize: 14, color: "#64748b" }}>
        <strong>{hall.name}</strong> will be permanently removed. This cannot be undone.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{
          height: 38, padding: "0 18px", borderRadius: 8,
          border: "1px solid #e2e8f0", background: "transparent",
          color: "#64748b", fontSize: 14, cursor: "pointer",
        }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{
          height: 38, padding: "0 18px", borderRadius: 8,
          border: "none", background: loading ? "#fca5a5" : "#dc2626",
          color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
        }}>{loading ? "Deleting…" : "Delete"}</button>
      </div>
    </div>
  </div>
);

/* ─── Main component ─────────────────────────────────────────── */
const ManageHalls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit'|'view', hall? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: "", status: "all", isActive: "all",
    amenity: "all", minCap: "", maxCap: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchHalls = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(API, { headers: authHeader() });
      setHalls(res.data.data || []);
    } catch {
      setError("Failed to load halls. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHalls(); }, [fetchHalls]);

  /* Filter logic */
  const filtered = halls.filter((h) => {
    const q = filters.search.toLowerCase();
    const matchSearch = !q ||
      h.name?.toLowerCase().includes(q) ||
      h.location?.building?.toLowerCase().includes(q) ||
      h.location?.roomNumber?.toLowerCase().includes(q) ||
      h.description?.toLowerCase().includes(q);
    const matchStatus = filters.status === "all" || h.status === filters.status;
    const matchActive = filters.isActive === "all" ||
      (filters.isActive === "active" ? h.isActive : !h.isActive);
    const hallAmenities = h.facilities || h.amenities || [];
    const matchAmenity = filters.amenity === "all" || hallAmenities.includes(filters.amenity);
    const matchMin = !filters.minCap || h.capacity >= Number(filters.minCap);
    const matchMax = !filters.maxCap || h.capacity <= Number(filters.maxCap);
    return matchSearch && matchStatus && matchActive && matchAmenity && matchMin && matchMax;
  });

  const clearFilters = () => setFilters({ search: "", status: "all", isActive: "all", amenity: "all", minCap: "", maxCap: "" });
  const hasFilters = Object.values(filters).some((v) => v !== "" && v !== "all");

  /* API actions */
  const handleSave = async (payload, id) => {
    try {
      if (id) {
        await axios.put(`${API}/${id}`, payload, { headers: authHeader() });
        showToast("Hall updated successfully!");
      } else {
        await axios.post(API, payload, { headers: authHeader() });
        showToast("Hall added successfully!");
      }
      setModal(null);
      fetchHalls();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      showToast(msg || "Something went wrong", "error");
      throw err;
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/${deleteTarget._id}`, { headers: authHeader() });
      showToast("Hall deleted.");
      setDeleteTarget(null);
      fetchHalls();
    } catch {
      showToast("Delete failed.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleStatus = async (hall) => {
    const newStatus = hall.status === "Available" ? "Unavailable" : "Available";
    try {
      await axios.put(`${API}/${hall._id}`, { ...hall, status: newStatus }, { headers: authHeader() });
      showToast(`Status changed to ${newStatus}`);
      fetchHalls();
    } catch {
      showToast("Status update failed.", "error");
    }
  };

  const inp = {
    height: 36, padding: "0 12px", fontSize: 13,
    border: "1px solid #e2e8f0", borderRadius: 8,
    background: "#fff", color: "#374151", outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem 1.5rem", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Manage halls</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
            {halls.length} total hall{halls.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => setModal({ mode: "add" })} style={{
          display: "flex", alignItems: "center", gap: 8,
          height: 40, padding: "0 18px", borderRadius: 9, border: "none",
          background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add hall
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: "1.25rem" }}>
        {[
          { label: "Total", value: halls.length, color: "#2563eb" },
          { label: "Available", value: halls.filter((h) => h.status === "Available").length, color: "#16a34a" },
          { label: "Unavailable", value: halls.filter((h) => h.status === "Unavailable").length, color: "#dc2626" },
          { label: "Active", value: halls.filter((h) => h.isActive).length, color: "#7c3aed" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "0.875rem 1rem" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Filters</p>
          {hasFilters && (
            <button onClick={clearFilters} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Clear all
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
          {/* Search */}
          <div style={{ position: "relative", gridColumn: "span 2" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>⌕</span>
            <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search name, building, description…"
              style={{ ...inp, width: "100%", paddingLeft: 28, boxSizing: "border-box" }} />
          </div>

          {/* Status */}
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={{ ...inp }}>
            <option value="all">All statuses</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>

          {/* Active */}
          <select value={filters.isActive} onChange={(e) => setFilters({ ...filters, isActive: e.target.value })} style={{ ...inp }}>
            <option value="all">Active & Inactive</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>

          {/* Amenity */}
          <select value={filters.amenity} onChange={(e) => setFilters({ ...filters, amenity: e.target.value })} style={{ ...inp }}>
            <option value="all">All amenities</option>
            {AMENITIES_LIST.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Capacity range */}
          <input type="number" value={filters.minCap} onChange={(e) => setFilters({ ...filters, minCap: e.target.value })}
            placeholder="Min capacity" style={{ ...inp }} min={0} />
          <input type="number" value={filters.maxCap} onChange={(e) => setFilters({ ...filters, maxCap: e.target.value })}
            placeholder="Max capacity" style={{ ...inp }} min={0} />
        </div>

        {hasFilters && (
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b" }}>
            Showing {filtered.length} of {halls.length} halls
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 16px",
          background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10,
          color: "#b91c1c", fontSize: 14, marginBottom: "1rem",
        }}>⚠ {error}</div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>All seminar halls</h2>
          <button onClick={fetchHalls} style={{ fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
            <div style={{
              width: 28, height: 28, border: "3px solid #e2e8f0",
              borderTopColor: "#2563eb", borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <span style={{ fontSize: 14, color: "#94a3b8" }}>Loading halls…</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Hall name", "Capacity", "Location", "Amenities", "Status", "Active", "Actions"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 14px", textAlign: "left", fontSize: 12,
                      fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                      letterSpacing: "0.04em", whiteSpace: "nowrap",
                      borderBottom: "1px solid #f1f5f9",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((hall, idx) => (
                  <tr key={hall._id} style={{
                    borderTop: "1px solid #f8fafc",
                    background: idx % 2 === 0 ? "#fff" : "#fafafa",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0f9ff"}
                    onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"}>

                    <td style={{ padding: "12px 14px" }}>
                      <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>{hall.name}</p>
                      {hall.description && (
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {hall.description}
                        </p>
                      )}
                    </td>

                    <td style={{ padding: "12px 14px", color: "#374151", fontWeight: 500 }}>
                      {hall.capacity}
                    </td>

                    <td style={{ padding: "12px 14px", color: "#64748b", whiteSpace: "nowrap" }}>
                      {[hall.location?.building, hall.location?.floor, hall.location?.roomNumber]
                        .filter(Boolean).join(" / ") || "—"}
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 200 }}>
                        {(hall.facilities || hall.amenities || []).slice(0, 3).map((a) => (
                          <span key={a} style={{
                            fontSize: 11, padding: "2px 7px", borderRadius: 999,
                            background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8",
                          }}>{a}</span>
                        ))}
                        {(hall.facilities || hall.amenities || []).length > 3 && (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>+{(hall.facilities || hall.amenities || []).length - 3}</span>
                        )}
                        {!((hall.facilities || hall.amenities || []).length) && <span style={{ fontSize: 12, color: "#cbd5e1" }}>None</span>}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={hall.status} />
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <ActiveBadge isActive={hall.isActive} />
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {/* View */}
                        <button onClick={() => setModal({ mode: "view", hall })}
                          title="View details"
                          style={{ height: 32, padding: "0 12px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                          View
                        </button>
                        {/* Edit */}
                        <button onClick={() => setModal({ mode: "edit", hall })}
                          title="Edit hall"
                          style={{ height: 32, padding: "0 12px", borderRadius: 7, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                          Edit
                        </button>
                        {/* Toggle status */}
                        <button onClick={() => toggleStatus(hall)}
                          title="Toggle availability"
                          style={{
                            height: 32, padding: "0 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer",
                            border: `1px solid ${hall.status === "Available" ? "#fca5a5" : "#86efac"}`,
                            background: hall.status === "Available" ? "#fef2f2" : "#f0fdf4",
                            color: hall.status === "Available" ? "#b91c1c" : "#15803d",
                          }}>
                          {hall.status === "Available" ? "Disable" : "Enable"}
                        </button>
                        {/* Delete */}
                        <button onClick={() => setDeleteTarget(hall)}
                          title="Delete hall"
                          style={{ height: 32, width: 32, borderRadius: 7, border: "1px solid #fca5a5", background: "#fef2f2", color: "#b91c1c", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                      <p style={{ fontSize: 32, margin: "0 0 8px" }}>🏛</p>
                      <p style={{ margin: 0, fontWeight: 500 }}>No halls match your filters</p>
                      {hasFilters && <p style={{ margin: "4px 0 0", fontSize: 13 }}>Try clearing a filter or adding a new hall.</p>}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <HallModal
          mode={modal.mode}
          hall={modal.hall}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          hall={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ManageHalls;