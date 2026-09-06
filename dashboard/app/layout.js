import "./globals.css";

export const metadata = {
  title: "HydroSurge AI — Flood Operations Command",
  description: "Emergency decision-support platform for urban flood nowcasting and incident response",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-[#070b14] text-slate-100">
      <body className="min-h-full flex flex-col antialiased selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}