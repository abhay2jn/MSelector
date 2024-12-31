import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users2, Radio, Headphones } from "lucide-react";
import Link from "next/link";
import Appbar from "../components/Appbar";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session?.user.id) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-gray-50 dark:via-gray-100 dark:to-white relative transition-colors duration-300">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] dark:bg-grid-black/[0.05]" />
      <div className="relative text-white dark:text-gray-900">
        <Appbar />
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Let Your Fans Choose the Beat
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 dark:text-gray-600">
            Empower your audience to create your music stream. Connect with fans
            like never before.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-purple-600 border-purple-600 hover:bg-purple-100 dark:bg-gray-900 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-gray-800"
            >
              Learn More
            </Button>
          </div>
        </section>
        <hr />
        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center bg-white/10 dark:bg-gray-900/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="mb-4 rounded-full bg-yellow-400/20 p-4">
                <Users2 className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Fan Interaction</h3>
              <p className="text-gray-300 dark:text-gray-600">
                Let fans choose the music
              </p>
            </div>
            <div className="flex flex-col items-center text-center bg-white/10 dark:bg-gray-900/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="mb-4 rounded-full bg-green-400/20 p-4">
                <Radio className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Live Streaming</h3>
              <p className="text-gray-300 dark:text-gray-600">
                Stream with real-time input
              </p>
            </div>
            <div className="flex flex-col items-center text-center bg-white/10 dark:bg-gray-900/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="mb-4 rounded-full bg-blue-400/20 p-4">
                <Headphones className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">High-Quality Audio</h3>
              <p className="text-gray-300 dark:text-gray-600">
                Crystal clear sound quality
              </p>
            </div>
          </div>
        </section>
        <hr />
        {/* Sign Up Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Transform Your Streams?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-300 dark:text-gray-600">
            Join Music UP today and create unforgettable experiences.
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/20 text-white placeholder:text-gray-400 border-white/30 dark:bg-gray-900/20 dark:text-gray-900 dark:placeholder:text-gray-500 dark:border-gray-900/30"
            />
            <Button className="bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 sm:w-28">
              Sign Up
            </Button>
          </div>
        </section>
        <hr />
        {/* Footer */}
        <footer className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-400 dark:text-gray-500 sm:flex-row">
            <p>© 2024 MusicGenre. All rights reserved.</p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="hover:text-white dark:hover:text-gray-900"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="hover:text-white dark:hover:text-gray-900"
              >
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
