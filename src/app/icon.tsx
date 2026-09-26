import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#171E19",
          borderRadius: "8px",
          border: "1.5px solid #FFE17C",
          position: "relative",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ticket Shield */}
          <path
            d="M 22 18 C 22 11 27 6 34 6 L 66 6 C 73 6 78 11 78 18 L 78 39 C 72 39 68 44 68 50 C 68 56 72 61 78 61 L 78 82 C 78 89 73 94 66 94 L 34 94 C 27 94 22 89 22 82 L 22 61 C 28 61 32 56 32 50 C 32 44 28 39 22 39 Z"
            fill="#171E19"
            stroke="#FFE17C"
            strokeWidth="4"
          />
          {/* Central AI Star Spark */}
          <path
            d="M 50 28 C 50 40 40 50 28 50 C 40 50 50 60 50 72 C 50 60 60 50 72 50 C 60 50 50 40 50 28 Z"
            fill="#FFE17C"
          />
          {/* Core Sparkle Center */}
          <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
