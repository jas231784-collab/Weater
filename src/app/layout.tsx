import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProviderWrapper } from "@/components/ui/use-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather & Currency Dashboard",
  description: "Premium weather and currency exchange dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <ToastProviderWrapper>{children}</ToastProviderWrapper>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
