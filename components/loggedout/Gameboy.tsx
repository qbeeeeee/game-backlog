import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Gameboy({ children }: { children: ReactNode }) {
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

      <div className="relative z-10 w-full max-w-md">
        <Card className="border-purple-500/60 bg-gray-950 shadow-[0_0_40px_rgba(168,85,247,0.45)]">
          <CardHeader className="items-center text-center">
            <div className="text-5xl select-none" aria-hidden="true">
              🕹️
            </div>
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

        {/* Bottom score blurb */}
        <p className="mt-4 text-center text-[11px] text-gray-700 tracking-widest">
          HI-SCORE: 999999 &nbsp;|&nbsp; CREDITS: ∞
        </p>
      </div>
    </div>
  );
}
