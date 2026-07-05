"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Gameboy from "@/components/loggedout/Gameboy";

// ---------------------------------------------------------------------------
// Landing / Login Page
// Retro arcade-themed login card. Clicking the button immediately redirects
// the user to /dashboard — no real authentication is performed.
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <Gameboy>
      <p className="animate-pulse text-yellow-400 text-sm tracking-widest uppercase">
        Press Start to Continue
      </p>

      <Button
        onClick={handleLogin}
        variant="outline"
        className="w-full border-cyan-400 bg-transparent py-5 text-sm font-bold uppercase tracking-widest text-cyan-300 hover:bg-cyan-400 hover:text-black hover:border-cyan-300"
      >
        Insert Coin to Login
      </Button>

      <p className="text-white">
        Don't have an account?{" "}
        <a href="/signup" className="text-cyan-400 underline">
          Sign Up
        </a>
      </p>
    </Gameboy>
  );
}
