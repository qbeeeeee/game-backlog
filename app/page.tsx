"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Gameboy from "@/components/loggedout/Gameboy";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <Gameboy isGameBoy={true}>
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
