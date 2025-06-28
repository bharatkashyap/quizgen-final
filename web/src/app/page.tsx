import * as React from "react";
import { MainNav } from "../components/main-nav";
import GetStarted from "../components/get-started";
import { auth } from "../lib/auth";
import Image from "next/image";

export default async function Home() {
  return (
    <div className="min-h-screen bg-background relative md:overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-l from-blue-500/20 to-purple-500/20 blur-3xl" />
      </div>

      <MainNav />

      <main className="relative mx-auto z-10">
        <section className="container mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
            {/* Left side: Hero content */}
            <div className="flex flex-col items-center md:items-start flex-1 space-y-6 ">
              <h1 className="text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-300% animate-gradient leading-tight text-left">
                Duolingo for anything
              </h1>
              <p className="text-xl text-muted-foreground font-light">
                Build leagues with leaderboard, submissions and manage your own
                audience!
              </p>
              <div className="flex flex-row items-center gap-4">
                <GetStarted />
                <a
                  href="/play/leagues"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  or view all leagues →
                </a>
              </div>
            </div>

            {/* Right side: Visual element */}
            <div className="relative flex-1 aspect-square min-w-[300px] max-w-[500px] group cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="relative w-full h-full rounded-2xl bg-[#0A0F1E] p-6 z-10">
                {/* Card content */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="px-3 py-1 bg-blue-500/20 rounded-full backdrop-blur-sm border border-blue-500/30">
                      <span className="text-xs font-medium text-blue-200">
                        Daily Quiz Question
                      </span>
                    </div>
                  </div>
                  <div className="relative h-36 md:h-54 lg:h-72 rounded-lg overflow-hidden">
                    <Image
                      src="https://fal.media/files/elephant/MBiGkVdDAIf5fTNaSBA00_4344fe724de44221a53cff063db35fa2.jpg"
                      alt="Daily Quiz Preview"
                      fill
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent" />
                  </div>
                </div>

                {/* Stats and CTA */}
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-center text-xs">
                    <span className="text-blue-300">attempts today</span>
                  </div>

                  <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium text-white">
                    Try Today's Question
                  </button>
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 -z-10 rounded-2xl animate-border-glow" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
