"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "sans-serif",
          gap: "1rem",
        }}
      >
        <h2>Đã xảy ra lỗi</h2>
        <button onClick={reset}>Thử lại</button>
      </body>
    </html>
  );
}
