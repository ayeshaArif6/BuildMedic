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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          log_text: logText,
        }),
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

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "white",
        padding: "50px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        BuildMedic
      </h1>

      <p
        style={{
          color: "#94a3b8",
          marginBottom: "35px",
          fontSize: "18px",
        }}
      >
        AI-powered CI/CD failure diagnosis platform
      </p>

      <textarea
        value={logText}
        onChange={(e) => setLogText(e.target.value)}
        placeholder="Paste failed GitHub Actions or CI/CD logs here..."
        style={{
          width: "100%",
          height: "260px",
          backgroundColor: "#172554",
          color: "white",
          border: "1px solid #334155",
          borderRadius: "16px",
          padding: "22px",
          fontSize: "15px",
          resize: "none",
          marginBottom: "25px",
          lineHeight: "1.6",
        }}
      />

      <button
        onClick={analyzeLog}
        disabled={loading}
        style={{
          background:
            "linear-gradient(to right, #7c3aed, #9333ea)",
          color: "white",
          border: "none",
          padding: "15px 28px",
          borderRadius: "12px",
          fontSize: "16px",
          cursor: "pointer",
          marginBottom: "35px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "10px",
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
            Analyzing Failure...
          </>
        ) : (
          "Analyze Failure"
        )}
      </button>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      {diagnosis && (
        <div
          style={{
            backgroundColor: "#111827",
            border: "1px solid #334155",
            borderRadius: "18px",
            padding: "35px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor:
                failureColors[diagnosis.failure_type] ||
                "#64748b",
              padding: "8px 16px",
              borderRadius: "999px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            {diagnosis.failure_type}
          </div>

          <h2
            style={{
              marginBottom: "20px",
              fontSize: "32px",
            }}
          >
            Diagnosis Result
          </h2>

          <p style={{ marginBottom: "15px" }}>
            <strong>Confidence:</strong>{" "}
            {diagnosis.confidence_score <= 1
              ? Math.round(
                  diagnosis.confidence_score * 100
                )
              : diagnosis.confidence_score}
            %
          </p>

          <p style={{ marginBottom: "15px" }}>
            <strong>Root Cause:</strong>{" "}
            {diagnosis.root_cause}
          </p>

          <p style={{ marginBottom: "15px" }}>
            <strong>Evidence:</strong>{" "}
            {diagnosis.evidence}
          </p>

          <p style={{ marginBottom: "20px" }}>
            <strong>Suggested Fix:</strong>{" "}
            {diagnosis.suggested_fix}
          </p>

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
            <h3
              style={{
                marginBottom: "15px",
                color: "#cbd5e1",
              }}
            >
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
  );
}

export default App;