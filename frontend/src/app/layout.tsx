import "./globals.css";

export const metadata = {
  title: "AI Kubernetes Agent",
  description: "Autonomous SRE Diagnostic System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-100 text-slate-800 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}