import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lumen: see which customers are leaking revenue";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "white",
            }}
          >
            &#9733;
          </div>
          <span style={{ fontSize: "32px", fontWeight: 700, color: "white" }}>
            Lumen
          </span>
        </div>
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            maxWidth: "900px",
          }}
        >
          See which customers are leaking revenue
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.85)",
            marginTop: "24px",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Explainable ML scores, SHAP reasons, and one-click win-back campaigns
        </div>
      </div>
    ),
    { ...size }
  );
}
