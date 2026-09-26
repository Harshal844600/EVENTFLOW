import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: "36px",
          border: "4px solid #FFE17C",
          position: "relative",
          boxShadow: "0 8px 32px rgba(255, 225, 124, 0.25)",
        }}
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ticket Shield */}
          <path
            d="M 22 18 C 22 11 27 6 34 6 L 66 6 C 73 6 78 11 78 18 L 78 39 C 72 39 68 44 68 50 C 68 56 72 61 78 61 L 78 82 C 78 89 73 94 66 94 L 34 94 C 27 94 22 89 22 82 L 22 61 C 28 61 32 56 32 50 C 32 44 28 39 22 39 Z"
            fill="#171E19"
            stroke="#FFE17C"
            strokeWidth="3.5"
          />
          {/* Perforated Inner Track */}
          <path
            d="M 27 21 C 27 16 31 12 36 12 L 64 12 C 69 12 73 16 73 21 L 73 37 C 67 39 63 44 63 50 C 63 56 67 61 73 63 L 73 79 C 73 84 69 88 64 88 L 36 88 C 31 88 27 84 27 79 L 27 63 C 33 61 37 56 37 50 C 37 44 33 39 27 37 Z"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.8"
          />
          {/* Central AI Star Spark */}
          <path
            d="M 50 28 C 50 40 40 50 28 50 C 40 50 50 60 50 72 C 50 60 60 50 72 50 C 60 50 50 40 50 28 Z"
            fill="#FFE17C"
          />
          {/* Micro Flare */}
          <path
            d="M 50 40 C 50 46 45 50 39 50 C 45 50 50 54 50 60 C 50 54 55 50 61 50 C 55 50 50 46 50 40 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
          {/* Core Sparkle Center */}
          <circle cx="50" cy="50" r="3" fill="#171E19" />
          <circle cx="50" cy="50" r="1.5" fill="#FFE17C" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
