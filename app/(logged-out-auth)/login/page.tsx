"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation<
    {
      data?: {
        user: {
          id: string;
          email: string;
          displayName: string;
          avatarUrl: string | null;
        };
      };
    },
    Error,
    { email: string; password: string }
  >({
    mutationFn: async (credentials) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const payload = (await response.json()) as {
        data?: {
          user: {
            id: string;
            email: string;
            displayName: string;
            avatarUrl: string | null;
          };
        };
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Login failed.");
      }

      return payload;
    },
    onSuccess: async (payload) => {
      setErrorMessage(null);

      queryClient.setQueryData(["auth", "me"], {
        data: {
          user: payload.data?.user,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      router.push("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    loginMutation.mutate({ email, password });
  }

  return (
    <>
      <p className="animate-pulse text-yellow-400 text-sm tracking-widest uppercase">
        Insert Credentials to Continue
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="block text-xs tracking-[0.25em] text-cyan-400 uppercase"
          >
            Player Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="player1@arcade.com"
            className="h-11 rounded-lg border-cyan-500/60 bg-black text-cyan-100 placeholder:text-cyan-800 focus-visible:border-cyan-300 focus-visible:ring-cyan-400/30"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="block text-xs tracking-[0.25em] text-cyan-400 uppercase"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            placeholder="********"
            className="h-11 rounded-lg border-cyan-500/60 bg-black text-cyan-100 placeholder:text-cyan-800 focus-visible:border-cyan-300 focus-visible:ring-cyan-400/30"
          />
        </div>

        {errorMessage ? (
          <p className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-xs tracking-wider text-red-300">
            {errorMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="outline"
          disabled={loginMutation.isPending}
          className="w-full border-cyan-400 bg-transparent py-5 text-sm font-bold uppercase tracking-widest text-cyan-300 hover:bg-cyan-400 hover:text-black hover:border-cyan-300"
        >
          {loginMutation.isPending ? "Logging In..." : "Login"}
        </Button>
      </form>

      <p className="text-white">
        Don't have an account?{" "}
        <Link href="/signup" className="text-cyan-400 underline">
          Sign Up
        </Link>
      </p>
    </>
  );
}
