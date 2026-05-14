import { useState } from "react";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (formData.newPassword && formData.newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    showToast("Profile updated successfully!");
  };

  const handleReset = () => {
    setFormData({
      name: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      password: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const getInitials = (name) =>
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join("") || "AU";

  const getStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthConfig = [
    { label: "Weak", color: "#E24B4A", width: "25%" },
    { label: "Fair", color: "#EF9F27", width: "50%" },
    { label: "Good", color: "#639922", width: "75%" },
    { label: "Strong", color: "#1D9E75", width: "100%" },
  ];

  const strength = getStrength(formData.newPassword);
  const currentStrength = strength > 0 ? strengthConfig[strength - 1] : null;

  return (
    <div style={styles.page}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            background:
              toast.type === "error"
                ? "#fff5f5"
                : "#f0fdf4",
            borderColor:
              toast.type === "error" ? "#fca5a5" : "#86efac",
            color: toast.type === "error" ? "#991b1b" : "#166534",
          }}
        >
          <span style={styles.toastIcon}>
            {toast.type === "error" ? "✕" : "✓"}
          </span>
          {toast.message}
        </div>
      )}

      <div style={styles.container}>
        {/* Profile Header Card */}
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <div style={styles.avatar}>{getInitials(formData.name)}</div>
            <div style={styles.headerInfo}>
              <h2 style={styles.displayName}>
                {formData.name || "Admin User"}
              </h2>
              <p style={styles.displayEmail}>
                {formData.email || "admin@example.com"}
              </p>
              <span style={styles.badge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 4 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {formData.role}
              </span>
            </div>
          </div>
        </div>

        {/* Account Details Card */}
        <div style={styles.card}>
          <p style={styles.sectionLabel}>Account details</p>
          <div style={styles.fieldGrid}>
            <Field label="Full name">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.inputBlur)}
              />
            </Field>
            <Field label="Email address">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.inputBlur)}
              />
            </Field>
            <Field label="Role">
              <input
                type="text"
                value={formData.role}
                disabled
                style={{ ...styles.input, ...styles.inputDisabled }}
              />
            </Field>
          </div>
        </div>

        {/* Password Card */}
        <div style={styles.card}>
          <p style={styles.sectionLabel}>Change password</p>
          <div style={styles.fieldGrid}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Current password">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  style={styles.input}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.inputBlur)}
                />
              </Field>
            </div>
            <Field label="New password">
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.inputBlur)}
              />
              {/* Strength bar */}
              <div style={styles.strengthTrack}>
                <div
                  style={{
                    ...styles.strengthBar,
                    width: currentStrength ? currentStrength.width : "0%",
                    background: currentStrength ? currentStrength.color : "transparent",
                  }}
                />
              </div>
              {currentStrength && (
                <p style={{ ...styles.strengthLabel, color: currentStrength.color }}>
                  {currentStrength.label}
                </p>
              )}
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                style={{
                  ...styles.input,
                  borderColor:
                    formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                      ? "#fca5a5"
                      : undefined,
                }}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, styles.inputBlur)}
              />
            </Field>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            onClick={handleSubmit}
            style={styles.btnPrimary}
            onMouseEnter={(e) => (e.target.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            Save changes
          </button>
          <button
            onClick={handleReset}
            style={styles.btnSecondary}
            onMouseEnter={(e) => (e.target.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "2rem 1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily:
      "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  toast: {
    position: "fixed",
    top: "1.25rem",
    right: "1.25rem",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 18px",
    borderRadius: 10,
    border: "1px solid",
    fontSize: 14,
    fontWeight: 500,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    animation: "fadeIn 0.2s ease",
  },
  toastIcon: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "currentColor",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    color: "#fff",
    flexShrink: 0,
  },
  container: {
    width: "100%",
    maxWidth: 640,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: "1.5rem",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 600,
    flexShrink: 0,
    border: "2px solid #dbeafe",
    letterSpacing: "0.02em",
  },
  headerInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  displayName: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  displayEmail: {
    margin: "2px 0 8px",
    fontSize: 13,
    color: "#64748b",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 999,
    background: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  sectionLabel: {
    margin: "0 0 1rem",
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#475569",
  },
  input: {
    width: "100%",
    height: 40,
    padding: "0 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  },
  inputFocus: {
    borderColor: "#93c5fd",
    boxShadow: "0 0 0 3px rgba(147,197,253,0.3)",
  },
  inputBlur: {
    borderColor: "#e2e8f0",
    boxShadow: "none",
  },
  inputDisabled: {
    background: "#f8fafc",
    color: "#94a3b8",
    cursor: "not-allowed",
  },
  strengthTrack: {
    height: 3,
    borderRadius: 2,
    background: "#f1f5f9",
    overflow: "hidden",
    marginTop: 6,
  },
  strengthBar: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.3s ease, background 0.3s ease",
  },
  strengthLabel: {
    margin: "4px 0 0",
    fontSize: 11,
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    gap: 10,
    paddingTop: 4,
  },
  btnPrimary: {
    height: 40,
    padding: "0 20px",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
  },
  btnSecondary: {
    height: 40,
    padding: "0 20px",
    borderRadius: 8,
    background: "transparent",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s",
    fontFamily: "inherit",
  },
};

export default Profile;