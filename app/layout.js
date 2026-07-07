import "./globals.css";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "Mentora",
  description: "mentora is a career growth platform where all features  at one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-screen font-mono antialiased overflow-x-hidden">
        <ClerkProvider>
          <NextThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
          </NextThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
