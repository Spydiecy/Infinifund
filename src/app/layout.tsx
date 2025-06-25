import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "./components/Navbar";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuraSkill",
  description: "BlockChain Based Hackathon Management System.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased bg-[#04111d]`}
        >
          <Providers>
          <Toaster
  position="top-center"
  reverseOrder={false}
  gutter={8}
  containerClassName=""
  containerStyle={{}}
  toastOptions={{
    // Define default options
    className: '',
    duration: 5000,
    removeDelay: 1000,

    // Default options for specific types
    success: {
      duration: 3000,
    },
  }}
/>

          <Navbar></Navbar>


        {children}
          </Providers>
          <Footer></Footer>
      </body>
    </html>
   
  );
}
