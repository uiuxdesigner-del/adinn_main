import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ReviewNotesProvider } from "@/components/review-notes";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "ADINN", template: "%s | ADINN" },
  description:
    "ADINN corporate website prototype: one company, multiple ways to connect brands with people.",
  openGraph: {
    siteName: "ADINN",
    title: "ADINN",
    images: [{ url: "/Adinn.png", width: 516, height: 201, alt: "ADINN Advertising Services Ltd." }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
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
