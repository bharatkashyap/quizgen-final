import { Public_Sans } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "../contexts/QueryClient";
import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Quizgen",
  description: "Host quiz leagues online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={publicSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
