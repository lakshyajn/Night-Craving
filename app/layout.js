import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./contexts/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "After 10",
  description: "Food at your doorsteps at night",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <CartProvider>
        {children}
      </CartProvider>
      </body>
    </html>
  );
}
