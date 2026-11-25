import { Inter } from "next/font/google";
import "./globals.css";
import LayoutShell from "./LayoutShell";
import { ToastProvider } from "./components/admin/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "INFLUENCER PRO | Your Influencer Portal",
  description: "Log in to manage your influencer jobs, track daily tasks, and check your earnings.",
  metadataBase: new URL("https://influencer-pro-app.vercel.app"),
  openGraph: {
    title: "INFLUENCER PRO | Your Influencer Portal",
    description: "Log in to manage your influencer jobs, track daily tasks, and check your earnings.",
    url: "https://influencer-pro-app.vercel.app",
    siteName: "INFLUENCER PRO",
    images: [
      {
        url: "/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "INFLUENCER PRO Portal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "INFLUENCER PRO | Your Influencer Portal",
    description: "Log in to manage your influencer jobs, track daily tasks, and check your earnings.",
    images: ["/og-image.png?v=3"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3" },
      { url: "/favicon-16x16.png?v=3", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png?v=3", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest?v=3",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body 
        suppressHydrationWarning 
        className={`${inter.className} antialiased bg-[#07050E] text-white`}
      >
        <ToastProvider>
          <LayoutShell>{children}</LayoutShell>
        </ToastProvider>
      </body>
    </html>
  );
}