import { useState } from "react";

const failureColors = {
  DEPENDENCY_ERROR: "#a855f7",
  TEST_FAILURE: "#ef4444",
  LINT_ERROR: "#f97316",
  TYPE_ERROR: "#eab308",
  ENV_SECRET_MISSING: "#06b6d4",
  BUILD_CONFIG_ERROR: "#3b82f6",
  DEPLOYMENT_ERROR: "#ec4899",
  FLAKY_TEST: "#facc15",
  UNKNOWN: "#64748b",
};

function App() {
  const [logText, setLogText] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const [errorExcerpt, setErrorExcerpt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyzeLog = async () => {
    if (!logText.trim()) return;
    setLoading(true);
    setDiagnosis(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log_text: logText }),
      });

      const data = await response.json();
      setDiagnosis(data.diagnosis);
      setErrorExcerpt(data.error_excerpt);
    } catch (error) {
      console.error("Error analyzing log:", error);
    }

    setLoading(false);
  };

  const copyCommand = async () => {
    if (!diagnosis?.fix_command) return;
    await navigator.clipboard.writeText(diagnosis.fix_command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatConfidence = (score) => {
    if (score <= 1) return Math.round(score * 100);
    return score;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(124,58,237,0.22), transparent 32%), radial-gradient(circle at top right, rgba(14,165,233,0.16), transparent 28%), #020617",
        color: "white",
        padding: "42px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "28px",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                padding: "8px 14px",
                borderRadius: "999px",
                backgroundColor: "rgba(124,58,237,0.18)",
                color: "#ddd6fe",
                border: "1px solid rgba(167,139,250,0.45)",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "18px",
              }}
            >
              AI CI/CD Debugging Assistant
            </div>

            <h1
              style={{
                fontSize: "60px",
                lineHeight: "0.95",
                margin: "0 0 16px 0",
                letterSpacing: "-2px",
              }}
            >
              Diagnose failed builds in seconds.
            </h1>

            <p
              style={{
                color: "#a5b4fc",
                fontSize: "18px",
                lineHeight: "1.7",
                maxWidth: "680px",
                margin: 0,
              }}
            >
              BuildMedic analyzes noisy CI/CD logs, extracts the real failure
              signal, and returns root-cause summaries with terminal-ready fixes.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "rgba(15,23,42,0.78)",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: "22px",
              padding: "22px",
              boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
            }}
          >
            {[
              ["Failure Types", "Dependencies, tests, config, deploys"],
              ["AI Output", "Root cause, evidence, fix command"],
              ["Next Upgrade", "GitHub Actions run import"],
            ].map(([title, desc]) => (
              <div
                key={title}
                style={{
                  padding: "14px 0",
                  borderBottom:
                    title === "Next Upgrade"
                      ? "none"
                      : "1px solid rgba(148,163,184,0.14)",
                }}
              >
                <div style={{ fontWeight: "700", marginBottom: "5px" }}>
                  {title}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </header>

        <section
          style={{
            backgroundColor: "rgba(15,23,42,0.88)",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: "24px",
            padding: "26px",
            boxShadow: "0 28px 90px rgba(0,0,0,0.38)",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              gap: "20px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "22px", margin: "0 0 6px 0" }}>
                Analyze Build Failure
              </h2>
              <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
                Paste your failed workflow output below.
              </p>
            </div>

            <span
              style={{
                color: "#c4b5fd",
                backgroundColor: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(167,139,250,0.3)",
                borderRadius: "999px",
                padding: "8px 13px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Manual Log Mode
            </span>
          </div>

          <textarea
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder={`Paste failed GitHub Actions or CI/CD logs here...

Example:
npm ERR! ERESOLVE could not resolve
Module not found: Can't resolve 'react-router-dom'
Error: Process completed with exit code 1`}
            style={{
              width: "100%",
              height: "285px",
              boxSizing: "border-box",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              border: "1px solid #334155",
              borderRadius: "18px",
              padding: "20px",
              fontSize: "15px",
              resize: "vertical",
              lineHeight: "1.65",
              outline: "none",
              marginBottom: "18px",
              fontFamily: "monospace",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["Extracts key lines", "Classifies error", "Suggests fix"].map(
                (item) => (
                  <span
                    key={item}
                    style={{
                      color: "#94a3b8",
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: "999px",
                      padding: "8px 12px",
                      fontSize: "13px",
                    }}
                  >
                    {item}
                  </span>
                )
              )}
            </div>

            <button
              onClick={analyzeLog}
              disabled={loading}
              style={{
                background: "linear-gradient(to right, #7c3aed, #a855f7)",
                color: "white",
                border: "none",
                padding: "15px 26px",
                borderRadius: "14px",
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: "170px",
                justifyContent: "center",
                boxShadow: "0 16px 40px rgba(124,58,237,0.38)",
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid white",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Analyzing...
                </>
              ) : (
                "Analyze Failure"
              )}
            </button>
          </div>
        </section>

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>

        {diagnosis && (
          <div
            style={{
              backgroundColor: "rgba(17,24,39,0.95)",
              border: "1px solid #334155",
              borderRadius: "22px",
              padding: "35px",
              boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                backgroundColor:
                  failureColors[diagnosis.failure_type] || "#64748b",
                padding: "8px 16px",
                borderRadius: "999px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              {diagnosis.failure_type}
            </div>

            <h2 style={{ marginBottom: "25px", fontSize: "32px" }}>
              Diagnosis Result
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                marginBottom: "28px",
                textAlign: "left",
              }}
            >
              <div>
                <strong style={{ display: "inline-block", width: "160px" }}>
                  Confidence:
                </strong>
                {formatConfidence(diagnosis.confidence_score)}%
              </div>

              <div>
                <strong style={{ display: "inline-block", width: "160px" }}>
                  Root Cause:
                </strong>
                {diagnosis.root_cause}
              </div>

              <div>
                <strong style={{ display: "inline-block", width: "160px" }}>
                  Evidence:
                </strong>
                {diagnosis.evidence}
              </div>

              <div>
                <strong style={{ display: "inline-block", width: "160px" }}>
                  Suggested Fix:
                </strong>
                {diagnosis.suggested_fix}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#020617",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "30px",
                border: "1px solid #1e293b",
                position: "relative",
              }}
            >
              <button
                onClick={copyCommand}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  backgroundColor: "#1e293b",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>

              <code
                style={{
                  color: "#38bdf8",
                  fontSize: "16px",
                  fontFamily: "monospace",
                }}
              >
                {diagnosis.fix_command}
              </code>
            </div>

            <div
              style={{
                backgroundColor: "#020617",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid #1e293b",
              }}
            >
              <h3 style={{ marginBottom: "15px", color: "#cbd5e1" }}>
                Extracted Log Lines Analyzed
              </h3>

              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  color: "#94a3b8",
                  lineHeight: "1.6",
                  fontSize: "14px",
                }}
              >
                {errorExcerpt}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;