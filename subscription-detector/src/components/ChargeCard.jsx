import { useState } from "react";

const ACCENT = {
  cancel: "#ff4d4d",
  review: "#f5a623",
  keep: "#63ffb2",
  hidden: "#a78bfa",
};

const BADGE = {
  cancel: { bg: "rgba(255,77,77,0.12)", color: "#ff4d4d", label: "CANCEL" },
  review: { bg: "rgba(245,166,35,0.12)", color: "#f5a623", label: "REVIEW" },
  keep:   { bg: "rgba(99,255,178,0.12)", color: "#63ffb2", label: "KEEP" },
};

function accentColor(item) {
  if (item.isHidden) return ACCENT.hidden;
  return ACCENT[item.recommendation] ?? ACCENT.review;
}

export default function ChargeCard({ item, onKeep, onDismiss, isDismissed }) {
  const [hovered, setHovered] = useState(false);

  const accent = accentColor(item);
  const badge = item.isHidden
    ? { bg: "rgba(167,139,250,0.12)", color: "#a78bfa", label: "HIDDEN FEE" }
    : BADGE[item.recommendation] ?? BADGE.review;

  return (
    <div
      style={{
        ...styles.card,
        borderLeft: `3px solid ${accent}`,
        borderColor: hovered
          ? accent
          : `transparent transparent transparent ${accent}`,
        outline: hovered ? `1px solid ${accent}44` : "1px solid #1e1e1e",
        opacity: isDismissed ? 0.3 : 1,
        transition: "opacity 0.3s ease, outline 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left: icon + info */}
      <div style={styles.left}>
        <div style={styles.iconBox}>{item.icon}</div>

        <div style={styles.info}>
          <span style={styles.name}>{item.name}</span>
          <span style={styles.reason}>{item.reason}</span>

          <div style={styles.tags}>
            <span style={{ ...styles.badge, background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
            <span style={styles.tag}>{item.frequency}</span>
            <span style={styles.tag}>{item.category}</span>
          </div>
        </div>
      </div>

      {/* Right: amount + actions */}
      <div style={styles.right}>
        <span style={styles.amount}>${Number(item.amount).toFixed(2)}</span>

        <div className="charge-card-actions" style={styles.actions}>
          <button
            style={{ ...styles.btn, ...styles.btnKeep }}
            onClick={() => onKeep(item.id)}
            title="Keep"
          >
            ✓
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnDismiss }}
            onClick={() => onDismiss(item.id)}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0e0e0e",
    borderRadius: "16px",
    padding: "1rem 1.25rem",
    gap: "1rem",
    cursor: "default",
  },
  left: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.85rem",
    flex: 1,
    minWidth: 0,
  },
  iconBox: {
    width: "40px",
    height: "40px",
    background: "#1a1a1a",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    flexShrink: 0,
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    minWidth: 0,
  },
  name: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#f0f0f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  reason: {
    fontSize: "0.78rem",
    color: "#666",
    lineHeight: 1.4,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginTop: "0.2rem",
  },
  badge: {
    fontSize: "0.65rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    padding: "2px 7px",
    borderRadius: "4px",
    textTransform: "uppercase",
  },
  tag: {
    fontSize: "0.65rem",
    fontWeight: 500,
    color: "#555",
    background: "#181818",
    padding: "2px 7px",
    borderRadius: "4px",
    textTransform: "capitalize",
  },
  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.6rem",
    flexShrink: 0,
  },
  amount: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontWeight: 700,
    fontSize: "1rem",
    color: "#f0f0f0",
  },
  actions: {
    display: "flex",
    gap: "0.4rem",
  },
  btn: {
    width: "28px",
    height: "28px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.15s ease",
  },
  btnKeep: {
    background: "rgba(99,255,178,0.12)",
    color: "#63ffb2",
  },
  btnDismiss: {
    background: "rgba(255,77,77,0.12)",
    color: "#ff4d4d",
  },
};
