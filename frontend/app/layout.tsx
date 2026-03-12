import "./styles.css";
import type { ReactNode } from "react";
import { AppProviders } from "./providers";

export const metadata = {
  title: "FormForge – AI Form Coach",
  description: "Realtime AI-powered form coaching in your browser."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-white antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

