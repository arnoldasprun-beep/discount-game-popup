import type { HeadersFunction, MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Screencast - Discount Game" },
    { name: "description", content: "Watch a demonstration of Discount Game Popup app" },
  ];
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "public, max-age=3600",
  };
};

export default function Screencast() {
  const videoId = "EV7ih2mNVGE";
  
  return (
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Discount Game Screencast</h1>
      
      <div style={{
        position: "relative",
        paddingBottom: "56.25%", // 16:9 aspect ratio
        height: 0,
        overflow: "hidden",
        maxWidth: "100%",
        background: "#000",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <iframe
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none"
          }}
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Discount Game Screencast"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
