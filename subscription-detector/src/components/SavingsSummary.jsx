import { useState } from "react";

function monthlyAmount(item) {
  const amt = Number(item.amount) || 0;
  if (item.frequency === "annual") return amt / 12;
  if (item.frequency === "weekly") return amt * 4.33;
  return amt;
}

export default function SavingsSummary({ charges, dismissed }) {
  const [copied, setCopied] = useState(false);

  const subscriptions = charges.filter((c) => !c.isHidden);
  const hiddenFees = charges.filter((c) => c.isHidden);
  const cancelItems = charges.filter(
    (c) => c.recommendation === "cancel" || dismissed.has(c.id)
  );

  const monthlySavings = cancelItems.reduce((sum, c) => sum + monthlyAmount(c), 0);
  const annualSavings = monthlySavings * 12;

  function handleCopy() {
    const lines = [
      "Subscription Detector — Savings Summary",
      "",
      `Potential monthly savings: $${monthlySavings.toFixed(2)}`,
      `Potential annual savings:  $${annualSavings.toFixed(2)}`,
      "",
      `Total charges scanned:     ${charges.length}`,
      `Subscriptions found:       ${subscriptions.length}`,
      `Hidden fees found:         ${hiddenFees.length}`,
      `Cancel recommendations:    ${cancelItems.length}`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={styles.card}>
      <div style={styles.glow} />

      <div style={styles.body}>
        <p style={styles.label}>potential monthly savings</p>
        <p style={styles.bigNumber}>${monthlySavings.toFixed(2)}</p>
        <p style={styles.subtext}>
          That&apos;s{" "}
          <span style={styles.highlightAnnual}>${annualSavings.toFixed(2)}/year</span>{" "}
          back in your pocket
        </p>

        <div style={styles.grid}>
          <Stat label="Charges scanned" value={charges.length} />
          <Stat label="Subscriptions" value={subscriptions.length} />
          <Stat label="Hidden fees" value={hiddenFees.length} />
          <Stat label="Cancel flags" value={cancelItems.length} />
        </div>

        <button
          style={{ ...styles.copyBtn, ...(copied ? styles.copyBtnDone : {}) }}
          onClick={handleCopy}
        >
          {copied ? "✓ Copied!" : "Copy Summary"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles = {
  card: {
    position: "relative",
    background: "#0e1a13",
    border: "1px solid rgba(99,255,178,0.15)",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "2rem",
  },
  glow: {
    position: "absolute",
    top: "-60px",
    right: "-60px",
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,255,178,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  body: {
    position: "relative",
    padding: "2rem 2rem 1.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(99,255,178,0.55)",
    margin: 0,
  },
  bigNumber: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontSize: "64px",
    fontWeight: 700,
    color: "#63ffb2",
    lineHeight: 1,
    margin: "0.15rem 0 0.25rem",
  },
  subtext: {
    fontSize: "0.88rem",
    color: "#557a65",
    margin: 0,
  },
  highlightAnnual: {
    color: "#63ffb2",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
    marginTop: "1.25rem",
  },
  stat: {
    background: "rgba(99,255,178,0.05)",
    border: "1px solid rgba(99,255,178,0.08)",
    borderRadius: "12px",
    padding: "0.75rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },
  statValue: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#f0f0f0",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "0.72rem",
    fontWeight: 500,
    color: "#4a7a5c",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  copyBtn: {
    marginTop: "1.25rem",
    alignSelf: "flex-start",
    background: "rgba(99,255,178,0.08)",
    border: "1px solid rgba(99,255,178,0.2)",
    color: "#63ffb2",
    borderRadius: "10px",
    padding: "0.5rem 1.25rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s ease, color 0.2s ease",
  },
  copyBtnDone: {
    background: "rgba(99,255,178,0.18)",
    color: "#fff",
  },
};
