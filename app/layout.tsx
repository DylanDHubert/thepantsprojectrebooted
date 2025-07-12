import type { Metadata } from "next";
import { Freckle_Face } from "next/font/google";
import "./globals.css";

// LOAD FRECKLE FACE FONT
const freckleFace = Freckle_Face({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Pants Project",
  description: "Interactive visualization of pants in latent space",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${freckleFace.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
