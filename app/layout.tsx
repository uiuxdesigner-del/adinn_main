import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ReviewNotesProvider } from "@/components/review-notes";
import { siteUrl } from "@/lib/seo";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "./" },
  title: { default: "ADINN", template: "%s | ADINN" },
  description:
    "ADINN brings strategy, creativity, media and on-ground execution together to help businesses grow across South India.",
  openGraph: {
    siteName: "ADINN",
    title: "ADINN",
    images: [{ url: "/Adinn.png", width: 516, height: 201, alt: "ADINN Advertising Services Ltd." }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* On a reload / back-forward with a saved scroll position, keep the pinned stories hidden until SmoothScroll has
            restored the scroll AND synced their animation state (removes data-restoring), so the opening is never shown. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var n=performance.getEntriesByType("navigation")[0];if(n&&(n.type==="reload"||n.type==="back_forward")&&Number(sessionStorage.getItem("adinn:scroll:"+location.pathname))>0)document.documentElement.setAttribute("data-restoring","");setTimeout(function(){document.documentElement.removeAttribute("data-restoring")},6000)}catch(e){}',
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-white text-ink">
        <ReviewNotesProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:outline focus:outline-2 focus:outline-ink"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
          <SmoothScroll />
        </ReviewNotesProvider>
      </body>
    </html>
  );
}
