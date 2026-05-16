const STEPS = [
  "Extracting transactions from PDF...",
  "Identifying recurring patterns...",
  "Detecting hidden fees...",
  "Generating recommendations...",
  "Calculating your savings...",
];

export default function LoadingScreen({ currentStep }) {
  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.ringWrapper}>
          <div style={styles.ring} />
        </div>

        <ul style={styles.list}>
          {STEPS.map((label, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <li key={i} style={stepStyle(isActive, isDone)}>
                <span style={dotStyle(isActive, isDone)} />
                {label}
              </li>
            );
          })}
        </ul>
      </div>

      <style>{CSS}</style>
    </div>
  );
}

function stepStyle(isActive, isDone) {
  let color, fontSize, opacity;
  if (isActive) {
    color = "#63ffb2";
    fontSize = "1.05rem";
    opacity = 1;
  } else if (isDone) {
    color = "#555";
    fontSize = "0.95rem";
    opacity = 0.6;
  } else {
    color = "#333";
    fontSize = "0.95rem";
    opacity = 0.35;
  }
  return {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    color,
    fontSize,
    opacity,
    fontWeight: isActive ? 600 : 400,
    transition: "all 0.4s ease",
    listStyle: "none",
    padding: "0.3rem 0",
  };
}

function dotStyle(isActive, isDone) {
  return {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
    background: isActive ? "#63ffb2" : isDone ? "#555" : "#333",
    transition: "background 0.4s ease",
  };
}

const styles = {
  backdrop: {
    minHeight: "100vh",
    background: "#0d0d0d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2.5rem",
  },
  ringWrapper: {
    width: "64px",
    height: "64px",
    position: "relative",
  },
  ring: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    border: "4px solid #1a1a1a",
    borderTopColor: "#63ffb2",
    animation: "spin 0.9s linear infinite",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    padding: 0,
    margin: 0,
  },
};

const CSS = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
