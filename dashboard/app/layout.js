import "./globals.css";

export const metadata = {
  title: "HydroSurge AI — Flood Operations Command",
  description: "Emergency decision-support platform for urban flood nowcasting and incident response",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-[var(--canvas)] text-[var(--text-primary)]">
      <body className="min-h-full flex flex-col antialiased selection:bg-rose-500 selection:text-white bg-[var(--canvas)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}