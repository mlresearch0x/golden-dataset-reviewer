import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./contexts/ThemeContext";

export const metadata: Metadata = {
  title: "Ground Truth Dataset Management System | ML Research Tool",
  description: "Professional ground truth dataset management tool for machine learning research. Import, review, edit, and approve ML training data with automatic tracking. Export to JSON, JSONL, and CSV formats. Free research tool for data scientists and ML engineers.",
  keywords: "ground truth, dataset management, machine learning, ML research, data annotation, training data, ML datasets, data labeling, research tool",
  authors: [{ name: "Solomon Aboyeji" }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Ground Truth Dataset Management System",
    description: "Manage and track ground truth datasets for machine learning research",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
