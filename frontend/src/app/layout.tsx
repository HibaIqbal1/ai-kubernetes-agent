import './globals.css';

export const metadata = {
  title: 'AI Kubernetes Agent',
  description: 'Investigate cluster issues with AI-powered root cause analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Tailwind CDN Script */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}