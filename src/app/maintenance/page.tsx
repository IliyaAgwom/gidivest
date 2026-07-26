import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Maintenance | HughVest",
  description: "We are performing scheduled maintenance. We'll be back shortly.",
};

export default function MaintenancePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #0d1f3c 0%, #030c1a 60%, #000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        padding: "2rem",
        textAlign: "center",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow orbs */}
      <div
        style={{
          position: "absolute",
          top: "-150px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Wrench / Gear icon (pure SVG, no extra deps) */}
      <div
        style={{
          marginBottom: "2rem",
          width: "96px",
          height: "96px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 60px rgba(16,185,129,0.4)",
          animation: "spin 6s linear infinite",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
          <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </div>

      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "99px",
          padding: "6px 16px",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#10b981",
          marginBottom: "1.5rem",
        }}
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#10b981",
            display: "inline-block",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        Scheduled Maintenance
      </div>

      <h1
        style={{
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: "1.25rem",
          background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        We&apos;re Upgrading<br />for You
      </h1>

      <p
        style={{
          fontSize: "1.1rem",
          color: "#94a3b8",
          maxWidth: "480px",
          lineHeight: 1.7,
          marginBottom: "2.5rem",
        }}
      >
        Our team is currently performing scheduled maintenance to improve your experience.
        We&apos;ll be back online very shortly. Thank you for your patience.
      </p>

      {/* Info card */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "1.5rem 2rem",
          maxWidth: "380px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.5rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          What to expect
        </div>
        {[
          "Your funds are safe and untouched",
          "Portfolio data is fully preserved",
          "We'll be back sooner than you think",
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 0",
              borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
              fontSize: "0.9rem",
              color: "#cbd5e1",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {item}
          </div>
        ))}
      </div>

      {/* Admin login link */}
      <a
        href="/login"
        style={{
          marginTop: "2.5rem",
          fontSize: "0.8rem",
          color: "#475569",
          textDecoration: "none",
          borderBottom: "1px solid #334155",
          paddingBottom: "2px",
          transition: "color 0.2s",
        }}
      >
        Admin? Sign in here →
      </a>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
