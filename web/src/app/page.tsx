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
                Build leagues online
              </h1>
              <p className="text-xl text-muted-foreground font-light">
                Get your own leaderboard, submissions and more
              </p>
              <div className="flex flex-row items-center gap-4">
                <GetStarted />
                <a
                  href="/play/leagues"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  or view other leagues →
                </a>
              </div>
            </div>

            {/* Right side: Visual element */}
            <div className="relative flex-1 aspect-square min-w-[300px] max-w-[500px] group cursor-pointer hover:scale-[1.02] transition-transform">
              {/* Main card */}
              <div className="absolute inset-0">
                {/* Glowing border container */}
                <div className="absolute -z-10 inset-[-1px] rounded-2xl bg-[#0A0F1E] p-[1px] before:absolute before:inset-[-2px] before:rounded-3xl before:p-[1px] before:bg-gradient-to-r before:from-transparent before:via-blue-500 before:to-transparent before:blur-sm before:animate-border-flow">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E] to-[#1A0F2E] rounded-2xl overflow-hidden">
                    {/* Decorative corner accents */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 transform rotate-45 translate-x-10 -translate-y-10" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 transform rotate-45 -translate-x-10 translate-y-10" />

                    {/* Daily challenge label */}

                    {/* Main content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
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
                      <div className="space-y-4">
                        <div className="flex items-center justify-center text-xs">
                          <span className="text-blue-300 mt-1">
                            attempts today
                          </span>
                        </div>

                        <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity group-hover:shadow-lg">
                          Try Today's Question
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
