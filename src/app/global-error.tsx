"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
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
        <button onClick={() => unstable_retry()}>Thử lại</button>
      </body>
    </html>
  );
}
