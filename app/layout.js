export const metadata = {
  title: "RollSafe",
  description: "Driver Vault + Inspection + Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0a0a0e",
          color: "#f5f5ff",
          fontFamily: "system-ui",
        }}
      >
        {children}
      </body>
    </html>
  );
}
