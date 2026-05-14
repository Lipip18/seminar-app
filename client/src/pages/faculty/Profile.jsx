import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);

  const initialData = useMemo(
    () => ({
      name: user?.name || "Faculty Member",
      email: user?.email || "faculty@example.com",
      department: user?.department || "Computer Science",
      designation: user?.designation || "Assistant Professor",
      role: "Faculty",
      phone: user?.phone || "",
      password: "",
      newPassword: "",
      confirmPassword: "",
    }),
    [user]
  );

  const [formData, setFormData] =
    useState(initialData);

  const [toast, setToast] =
    useState(null);

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(
      () => setToast(null),
      3500
    );
  };

  const handleChange = (
    e
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = () => {
    if (
      formData.newPassword &&
      formData.newPassword
        .length < 8
    ) {
      showToast(
        "Password must be at least 8 characters.",
        "error"
      );
      return;
    }

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      showToast(
        "New passwords do not match.",
        "error"
      );
      return;
    }

    showToast(
      "Profile updated successfully!"
    );
  };

  const handleReset = () => {
    setFormData(initialData);
  };

  const getInitials = (
    name
  ) =>
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((w) =>
        w[0].toUpperCase()
      )
      .slice(0, 2)
      .join("") || "FM";

  const getStrength = (
    pw
  ) => {
    if (!pw) return 0;

    let score = 0;

    if (pw.length >= 8)
      score++;

    if (/[A-Z]/.test(pw))
      score++;

    if (/[0-9]/.test(pw))
      score++;

    if (
      /[^A-Za-z0-9]/.test(pw)
    )
      score++;

    return score;
  };

  const strengthConfig = [
    {
      label: "Weak",
      color: "#E24B4A",
      width: "25%",
    },
    {
      label: "Fair",
      color: "#EF9F27",
      width: "50%",
    },
    {
      label: "Good",
      color: "#639922",
      width: "75%",
    },
    {
      label: "Strong",
      color: "#1D9E75",
      width: "100%",
    },
  ];

  const strength =
    getStrength(
      formData.newPassword
    );

  const currentStrength =
    strength > 0
      ? strengthConfig[
          strength - 1
        ]
      : null;

  return (
    <div style={styles.page}>
      {/* TOAST */}

      {toast && (
        <div
          style={{
            ...styles.toast,
            background:
              toast.type ===
              "error"
                ? "#fff5f5"
                : "#f0fdf4",
            borderColor:
              toast.type ===
              "error"
                ? "#fca5a5"
                : "#86efac",
            color:
              toast.type ===
              "error"
                ? "#991b1b"
                : "#166534",
          }}
        >
          <span
            style={
              styles.toastIcon
            }
          >
            {toast.type ===
            "error"
              ? "✕"
              : "✓"}
          </span>

          {toast.message}
        </div>
      )}

      <div style={styles.container}>
        {/* PROFILE HEADER */}

        <div style={styles.card}>
          <div
            style={
              styles.headerRow
            }
          >
            <div
              style={
                styles.avatar
              }
            >
              {getInitials(
                formData.name
              )}
            </div>

            <div
              style={
                styles.headerInfo
              }
            >
              <h2
                style={
                  styles.displayName
                }
              >
                {formData.name}
              </h2>

              <p
                style={
                  styles.displayEmail
                }
              >
                {formData.email}
              </p>

              <div
                style={{
                  display:
                    "flex",
                  gap: 8,
                  flexWrap:
                    "wrap",
                  marginTop: 4,
                }}
              >
                <span
                  style={
                    styles.badge
                  }
                >
                  Faculty
                </span>

                <span
                  style={{
                    ...styles.badge,
                    background:
                      "#eff6ff",
                    border:
                      "1px solid #bfdbfe",
                    color:
                      "#1d4ed8",
                  }}
                >
                  {
                    formData.designation
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ACCOUNT DETAILS */}

        <div style={styles.card}>
          <p
            style={
              styles.sectionLabel
            }
          >
            Faculty details
          </p>

          <div
            style={
              styles.fieldGrid
            }
          >
            <Field label="Full name">
              <input
                type="text"
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                placeholder="Your full name"
                style={
                  styles.input
                }
              />
            </Field>

            <Field label="Email address">
              <input
                type="email"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                placeholder="you@example.com"
                style={
                  styles.input
                }
              />
            </Field>

            <Field label="Department">
              <input
                type="text"
                name="department"
                value={
                  formData.department
                }
                onChange={
                  handleChange
                }
                placeholder="Department"
                style={
                  styles.input
                }
              />
            </Field>

            <Field label="Designation">
              <input
                type="text"
                name="designation"
                value={
                  formData.designation
                }
                onChange={
                  handleChange
                }
                placeholder="Designation"
                style={
                  styles.input
                }
              />
            </Field>

            <Field label="Phone number">
              <input
                type="text"
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                placeholder="+91 XXXXX XXXXX"
                style={
                  styles.input
                }
              />
            </Field>

            <Field label="Role">
              <input
                type="text"
                value={
                  formData.role
                }
                disabled
                style={{
                  ...styles.input,
                  ...styles.inputDisabled,
                }}
              />
            </Field>
          </div>
        </div>

        {/* PASSWORD */}

        <div style={styles.card}>
          <p
            style={
              styles.sectionLabel
            }
          >
            Change password
          </p>

          <div
            style={
              styles.fieldGrid
            }
          >
            <div
              style={{
                gridColumn:
                  "1 / -1",
              }}
            >
              <Field label="Current password">
                <input
                  type="password"
                  name="password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter current password"
                  style={
                    styles.input
                  }
                />
              </Field>
            </div>

            <Field label="New password">
              <input
                type="password"
                name="newPassword"
                value={
                  formData.newPassword
                }
                onChange={
                  handleChange
                }
                placeholder="Min. 8 characters"
                style={
                  styles.input
                }
              />

              <div
                style={
                  styles.strengthTrack
                }
              >
                <div
                  style={{
                    ...styles.strengthBar,
                    width:
                      currentStrength
                        ? currentStrength.width
                        : "0%",
                    background:
                      currentStrength
                        ? currentStrength.color
                        : "transparent",
                  }}
                />
              </div>

              {currentStrength && (
                <p
                  style={{
                    ...styles.strengthLabel,
                    color:
                      currentStrength.color,
                  }}
                >
                  {
                    currentStrength.label
                  }
                </p>
              )}
            </Field>

            <Field label="Confirm new password">
              <input
                type="password"
                name="confirmPassword"
                value={
                  formData.confirmPassword
                }
                onChange={
                  handleChange
                }
                placeholder="Repeat new password"
                style={{
                  ...styles.input,
                  borderColor:
                    formData.confirmPassword &&
                    formData.newPassword !==
                      formData.confirmPassword
                      ? "#fca5a5"
                      : "#e2e8f0",
                }}
              />
            </Field>
          </div>
        </div>

        {/* ACTIONS */}

        <div style={styles.actions}>
          <button
            onClick={
              handleSubmit
            }
            style={
              styles.btnPrimary
            }
          >
            Save Changes
          </button>

          <button
            onClick={
              handleReset
            }
            style={
              styles.btnSecondary
            }
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection:
        "column",
      gap: 6,
    }}
  >
    <label style={styles.label}>
      {label}
    </label>

    {children}
  </div>
);

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "2rem 1rem",
    display: "flex",
    justifyContent:
      "center",
    fontFamily:
      "'DM Sans', sans-serif",
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
    boxShadow:
      "0 4px 16px rgba(0,0,0,0.08)",
  },

  toastIcon: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background:
      "currentColor",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    fontSize: 11,
    color: "#fff",
  },

  container: {
    width: "100%",
    maxWidth: 720,
    display: "flex",
    flexDirection:
      "column",
    gap: "1rem",
  },

  card: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: 16,
    padding: "1.5rem",
    boxShadow:
      "0 1px 2px rgba(0,0,0,0.03)",
  },

  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    fontSize: 22,
    fontWeight: 700,
    border:
      "2px solid #dbeafe",
  },

  headerInfo: {
    display: "flex",
    flexDirection:
      "column",
  },

  displayName: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
  },

  displayEmail: {
    margin:
      "4px 0 6px",
    color: "#64748b",
    fontSize: 14,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background: "#f0fdf4",
    color: "#15803d",
    border:
      "1px solid #bbf7d0",
    textTransform:
      "uppercase",
  },

  sectionLabel: {
    margin: "0 0 1rem",
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform:
      "uppercase",
    letterSpacing: "0.08em",
  },

  fieldGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "1rem",
  },

  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#475569",
  },

  input: {
    width: "100%",
    height: 42,
    padding: "0 12px",
    border:
      "1px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    color: "#0f172a",
    background: "#fff",
    boxSizing:
      "border-box",
  },

  inputDisabled: {
    background: "#f8fafc",
    color: "#94a3b8",
    cursor: "not-allowed",
  },

  strengthTrack: {
    height: 4,
    borderRadius: 999,
    background: "#f1f5f9",
    overflow: "hidden",
    marginTop: 6,
  },

  strengthBar: {
    height: "100%",
    borderRadius: 999,
    transition:
      "0.3s ease",
  },

  strengthLabel: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: 700,
  },

  actions: {
    display: "flex",
    gap: 12,
    marginTop: 4,
  },

  btnPrimary: {
    height: 42,
    padding: "0 20px",
    borderRadius: 10,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },

  btnSecondary: {
    height: 42,
    padding: "0 20px",
    borderRadius: 10,
    background: "#fff",
    color: "#475569",
    border:
      "1px solid #e2e8f0",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 14,
  },
};

export default Profile;