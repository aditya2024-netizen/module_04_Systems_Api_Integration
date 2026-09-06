import "./globals.css";

export const metadata = {
  title: "HydroSurge AI — Decision Dashboard (SIH PS 26071)",
  description: "Module 4: Systems & API Integration Layer for Urban Flood Nowcasting and Emergency Decision Support",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}