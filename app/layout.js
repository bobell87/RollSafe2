import "./globals.css";

export const metadata = {
  title: "RollSafe",
  description: "Driver Vault + Inspection Mode + Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
