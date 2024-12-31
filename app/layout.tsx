import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { Bounce, ToastContainer, ToastContainerProps } from "react-toastify";
import "react-toastify/ReactToastify.css";

const globslToastOptions: ToastContainerProps = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
  transition: Bounce,
};

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MUSIC UP",
  description: "Choose your music",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <ToastContainer {...globslToastOptions} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
