import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/shared/components/ToastContainer";
import { TourGuide } from "@/shared/components/TourGuide";

export const metadata: Metadata = {
  title: "TaskCanvas | Kanban & Image Annotation",
  description: "A 2-in-1 productivity tool: Kanban task management by date and image polygon annotation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ToastContainer />
        <TourGuide />
      </body>
    </html>
  );
}

