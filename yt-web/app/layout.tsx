import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { CartFlyAnimation } from "@/components/storefront/CartFlyAnimation";
import { FloatingToast } from "@/components/storefront/FloatingToast";
import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";
import { PaymentCartCookieSync } from "@/components/storefront/PaymentCartCookieSync";
import { ShopSettingsProvider } from "@/components/storefront/ShopSettingsProvider";
import { StoreClosedBanner } from "@/components/storefront/StoreClosedBanner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getShopSettingsPublic } from "@/lib/shopSettings.server";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yanney Trendss — Style That Speaks Before You Do",
  description: "Luxury fashion boutique — Dansoman, Accra, Ghana.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeBoot = `(function(){try{var k='yanney-theme';var t=localStorage.getItem(k);var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var v=t||(d?'dark':'light');document.documentElement.classList.toggle('dark',v==='dark');}catch(e){}})();`;
  const shopSettings = await getShopSettingsPublic();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} font-sans min-h-screen bg-brand-bg text-brand-text antialiased transition-colors`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        <ThemeProvider>
          <ShopSettingsProvider value={shopSettings}>
            <PaymentCartCookieSync />
            <Navbar />
            <StoreClosedBanner />
            <main className="min-h-[50vh]">{children}</main>
            <Footer />
            <CartDrawer />
            <CartFlyAnimation />
            <FloatingToast />
          </ShopSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
