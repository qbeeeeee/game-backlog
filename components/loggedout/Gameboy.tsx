import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Gameboy({
  children,
  isGameBoy = false,
}: {
  children: ReactNode;
  isGameBoy?: boolean;
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      {/* Scanline overlay for CRT effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        }}
      />

      <div
        className={`${
          isGameBoy
            ? "bg-purple-400 w-104 h-145 items-center pt-8 rounded-2xl z-20"
            : "w-full items-center justify-center"
        } flex flex-col`}
      >
        <div className={`relative z-10 ${isGameBoy ? "w-90" : "w-md"}`}>
          <Card className="border-purple-500/60 bg-gray-950 shadow-[0_0_40px_rgba(168,85,247,0.45)]">
            <CardHeader className="items-center text-center">
              {!isGameBoy && (
                <div className="text-5xl select-none" aria-hidden="true">
                  🕹️
                </div>
              )}
              <CardTitle className="mt-3 text-3xl font-bold tracking-widest text-purple-400 uppercase drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                QBEE'S BACKLOG
              </CardTitle>
              <p className="mt-1 text-xs tracking-[0.3em] text-cyan-400 uppercase">
                &gt;&gt; Player 1 Portal &lt;&lt;
              </p>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-6">
              <Separator className="bg-linear-to-r from-transparent via-purple-500 to-transparent" />

              {children}

              <p className="text-[10px] text-gray-600 tracking-widest uppercase">
                © 1985 Retro Arcade Systems
              </p>
            </CardContent>
          </Card>

          {!isGameBoy && (
            <p className="mt-4 text-center text-[11px] text-gray-700 tracking-widest">
              HI-SCORE: 999999 &nbsp;|&nbsp; CREDITS: ∞
            </p>
          )}
        </div>

        {isGameBoy && (
          <div className="flex flex-col items-center h-full w-full">
            <div className="flex items-center justify-around w-full mt-12">
              <div className="relative">
                <div className="opacity-0">dddddddd</div>
                <div className="w-20 h-7 rounded-md bg-gray-900 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                <div className="w-7 h-20 rounded-md bg-gray-900 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col items-end gap-1">
                  <div className="w-10 h-10 rounded-full bg-gray-900 mt-6" />
                  <p className="text-sm font-bold text-gray-900 rotate-[-25deg]">
                    B
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="w-10 h-10 rounded-full bg-gray-900" />
                  <p className="text-sm font-bold text-gray-900 rotate-[-25deg]">
                    A
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-2.5 bg-gray-900 rounded-full" />
                <p className="text-xs text-gray-900">select</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-2.5 bg-gray-900 rounded-full" />
                <p className="text-xs text-gray-900">start</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
