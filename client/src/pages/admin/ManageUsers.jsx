import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const API = "http://localhost:5000/api/users";
const token = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

const ROLES = ["admin", "faculty", "student"];

const ROLE_STYLE = {
  admin:   { bg: "#faf5ff", border: "#d8b4fe", color: "#7e22ce" },
  faculty: { bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" },
  student: { bg: "#f0fdf4", border: "#86efac", color: "#15803d" },
};

/* ── helpers ─────────────────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const s = ROLE_STYLE[role] || ROLE_STYLE.student;
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      textTransform: "capitalize",
    }}>{role}</span>
  );
};

const ActiveBadge = ({ isActive }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
    background: isActive ? "#f0fdf4" : "#fef2f2",
    border: `1px solid ${isActive ? "#86efac" : "#fca5a5"}`,
    color: isActive ? "#15803d" : "#b91c1c",
  }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? "#16a34a" : "#dc2626" }} />
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

/* ── Avatar initials ─────────────────────────────────────────── */
const Avatar = ({ name, size = 36 }) => {
  const initials = (name || "?").split(" ").filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join("");
  const colors = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "22", border: `1.5px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color, flexShrink: 0,
      letterSpacing: "0.02em",
    }}>{initials}</div>
  );
};

/* ── View / Edit Modal ───────────────────────────────────────── */
const UserModal = ({ mode, user, onClose, onSave }) => {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const isView = mode === "view";

  const handleSave = async () => {
    if (role === user.role) { onClose(); return; }
    setSaving(true);
    await onSave(user._id, role);
    setSaving(false);
  };

  const inp = {
    height: 38, padding: "0 12px", fontSize: 14,
    border: "1px solid #e2e8f0", borderRadius: 8,
    background: "#fff", color: "#0f172a", outline: "none",
    fontFamily: "inherit", width: "100%", boxSizing: "border-box",
  };

  const row = (label, value) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <div style={{ ...inp, display: "flex", alignItems: "center", background: "#f8fafc", color: "#374151", cursor: "default" }}>{value}</div>
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "1rem",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440,
        overflow: "hidden", animation: "fadeUp 0.2s ease",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
            {isView ? "User details" : "Edit user"}
          </h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0",
            background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 16,
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "1rem", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
            <Avatar name={user.name} size={52} />
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{user.name}</p>
              <p style={{ margin: "2px 0 6px", fontSize: 13, color: "#64748b" }}>{user.email}</p>
              <div style={{ display: "flex", gap: 6 }}>
                <RoleBadge role={user.role} />
                <ActiveBadge isActive={user.isActive} />
              </div>
            </div>
          </div>

          {row("Email", user.email)}
          {row("Created", user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—")}

          {/* Role select — editable only in edit mode */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</label>
            {isView ? (
              <div style={{ ...inp, display: "flex", alignItems: "center", background: "#f8fafc", color: "#374151" }}>
                <RoleBadge role={user.role} />
              </div>
            ) : (
              <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            )}
          </div>

          {/* Stats */}
          {user.bookings !== undefined && (
            <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 10, padding: "0.875rem 1rem" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total bookings</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{user.bookings?.length ?? 0}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isView && (
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={onClose} style={{
              height: 38, padding: "0 18px", borderRadius: 8, border: "1px solid #e2e8f0",
              background: "transparent", color: "#64748b", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{
              height: 38, padding: "0 20px", borderRadius: 8, border: "none",
              background: saving ? "#93c5fd" : "#2563eb", color: "#fff",
              fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Delete confirm modal ────────────────────────────────────── */
const DeleteModal = ({ user, onClose, onConfirm, loading }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  }} onClick={onClose}>
    <div style={{
      background: "#fff", borderRadius: 16, width: "100%", maxWidth: 380,
      padding: "1.5rem", animation: "fadeUp 0.2s ease",
    }} onClick={e => e.stopPropagation()}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>🗑</div>
      <h2 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Delete user?</h2>
      <p style={{ margin: "0 0 1.5rem", fontSize: 14, color: "#64748b" }}>
        <strong>{user.name}</strong> ({user.email}) will be permanently removed. This cannot be undone.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ height: 38, padding: "0 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "transparent", color: "#64748b", fontSize: 14, cursor: "pointer" }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{ height: 38, padding: "0 18px", borderRadius: 8, border: "none", background: loading ? "#fca5a5" : "#dc2626", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

/* ── Main ────────────────────────────────────────────────────── */
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'view'|'edit', user }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [filters, setFilters] = useState({ search: "", role: "all", isActive: "all" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(API, { headers: authHeader() });
      setUsers(res.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(msg || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* Filter */
  const filtered = users.filter(u => {
    const q = filters.search.toLowerCase();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = filters.role === "all" || u.role === filters.role;
    const matchActive = filters.isActive === "all" ||
      (filters.isActive === "active" ? u.isActive : !u.isActive);
    return matchSearch && matchRole && matchActive;
  });

  const hasFilters = filters.search || filters.role !== "all" || filters.isActive !== "all";
  const clearFilters = () => setFilters({ search: "", role: "all", isActive: "all" });

  /* Actions */
  const handleRoleSave = async (id, role) => {
    try {
      await axios.patch(`${API}/${id}/role`, { role }, { headers: authHeader() });
      showToast("Role updated successfully!");
      setModal(null);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      showToast(msg || "Failed to update role.", "error");
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/${deleteTarget._id}`, { headers: authHeader() });
      showToast("User deleted.");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      showToast(msg || "Delete failed.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* Stats */
  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === "admin").length,
    faculty: users.filter(u => u.role === "faculty").length,
    student: users.filter(u => u.role === "student").length,
  };

  const inp = {
    height: 36, padding: "0 12px", fontSize: 13,
    border: "1px solid #e2e8f0", borderRadius: 8,
    background: "#fff", color: "#374151", outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem 1.5rem", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Manage users</h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: "1.25rem" }}>
        {[
          { label: "Total", value: stats.total, color: "#2563eb" },
          { label: "Admins", value: stats.admin, color: "#7e22ce" },
          { label: "Faculty", value: stats.faculty, color: "#1d4ed8" },
          { label: "Students", value: stats.student, color: "#15803d" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "0.875rem 1rem" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Filters</p>
          {hasFilters && (
            <button onClick={clearFilters} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Clear all</button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14, pointerEvents: "none" }}>⌕</span>
            <input value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by name or email…"
              style={{ ...inp, width: "100%", paddingLeft: 28, boxSizing: "border-box" }} />
          </div>
          {/* Role */}
          <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })} style={{ ...inp }}>
            <option value="all">All roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          {/* Active */}
          <select value={filters.isActive} onChange={e => setFilters({ ...filters, isActive: e.target.value })} style={{ ...inp }}>
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>
        {hasFilters && (
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b" }}>
            Showing {filtered.length} of {users.length} users
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 14, marginBottom: "1rem" }}>
          ⚠ {error}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>All users</h2>
          <button onClick={fetchUsers} style={{ fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>↻ Refresh</button>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
            <div style={{ width: 28, height: 28, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 14, color: "#94a3b8" }}>Loading users…</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["User", "Email", "Role", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <tr key={user._id}
                    style={{ borderTop: "1px solid #f8fafc", background: idx % 2 === 0 ? "#fff" : "#fafafa", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"}>

                    {/* User */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={user.name} />
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>{user.name}</p>
                          {user.createdAt && (
                            <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8" }}>
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: "12px 14px", color: "#64748b" }}>{user.email}</td>

                    {/* Role */}
                    <td style={{ padding: "12px 14px" }}><RoleBadge role={user.role} /></td>

                    {/* Status */}
                    <td style={{ padding: "12px 14px" }}><ActiveBadge isActive={user.isActive} /></td>

                    {/* Actions */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button onClick={() => setModal({ mode: "view", user })}
                          style={{ height: 32, padding: "0 12px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                          View
                        </button>
                        <button onClick={() => setModal({ mode: "edit", user })}
                          style={{ height: 32, padding: "0 12px", borderRadius: 7, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                          Edit role
                        </button>
                        <button onClick={() => setDeleteTarget(user)}
                          style={{ height: 32, width: 32, borderRadius: 7, border: "1px solid #fca5a5", background: "#fef2f2", color: "#b91c1c", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                      <p style={{ fontSize: 32, margin: "0 0 8px" }}>👤</p>
                      <p style={{ margin: 0, fontWeight: 500 }}>No users found</p>
                      {hasFilters && <p style={{ margin: "4px 0 0", fontSize: 13 }}>Try adjusting your filters</p>}
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
        <UserModal mode={modal.mode} user={modal.user} onClose={() => setModal(null)} onSave={handleRoleSave} />
      )}
      {deleteTarget && (
        <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleteLoading} />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
};

export default ManageUsers;