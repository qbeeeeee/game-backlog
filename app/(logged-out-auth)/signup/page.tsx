"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getPasswordChecks(password: string) {
  return {
    hasMinLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

function getPasswordValidationMessage(password: string) {
  const checks = getPasswordChecks(password);

  if (!checks.hasMinLength) {
    return "Password must be at least 8 characters long.";
  }

  if (!checks.hasLowercase) {
    return "Password must include at least one lowercase letter.";
  }

  if (!checks.hasUppercase) {
    return "Password must include at least one uppercase letter.";
  }

  if (!checks.hasNumber) {
    return "Password must include at least one number.";
  }

  if (!checks.hasSpecial) {
    return "Password must include at least one special character.";
  }

  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const passwordChecks = getPasswordChecks(password);
  const hasStartedConfirming = confirmPassword.length > 0;
  const confirmPasswordMismatch =
    hasStartedConfirming && password !== confirmPassword;

  const signupMutation = useMutation<
    {
      data?: {
        user: {
          id: string;
          email: string;
          displayName: string | null;
          avatarUrl: string | null;
        };
      };
    },
    Error,
    { firstName: string; lastName: string; email: string; password: string }
  >({
    mutationFn: async (values) => {
      const displayName = `${values.firstName} ${values.lastName}`.trim();

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          displayName,
        }),
      });

      const payload = (await response.json()) as {
        data?: {
          user: {
            id: string;
            email: string;
            displayName: string | null;
            avatarUrl: string | null;
          };
        };
        error?: {
          message?: string;
          details?: Array<{ path?: string; message?: string }>;
        };
      };

      if (!response.ok) {
        const firstDetailMessage = payload.error?.details?.[0]?.message;

        throw new Error(
          firstDetailMessage ?? payload.error?.message ?? "Signup failed.",
        );
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

    const passwordValidationMessage = getPasswordValidationMessage(password);

    if (passwordValidationMessage) {
      setErrorMessage(passwordValidationMessage);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    signupMutation.mutate({
      firstName,
      lastName,
      email,
      password,
    });
  }

  return (
    <>
      <p className="animate-pulse text-sm tracking-widest text-yellow-400 uppercase">
        Create your account
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="block text-xs tracking-[0.25em] text-cyan-400 uppercase"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              required
              placeholder="Kyuubi"
              className="h-11 rounded-lg border-cyan-500/60 bg-black text-cyan-100 placeholder:text-cyan-800 focus-visible:border-cyan-300 focus-visible:ring-cyan-400/30"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="block text-xs tracking-[0.25em] text-cyan-400 uppercase"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
              required
              placeholder="Player"
              className="h-11 rounded-lg border-cyan-500/60 bg-black text-cyan-100 placeholder:text-cyan-800 focus-visible:border-cyan-300 focus-visible:ring-cyan-400/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="block text-xs tracking-[0.25em] text-cyan-400 uppercase"
          >
            Email
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
          <div className="relative">
            <Input
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              placeholder="********"
              className="h-11 rounded-lg border-cyan-500/60 bg-black pr-12 text-cyan-100 placeholder:text-cyan-800 focus-visible:border-cyan-300 focus-visible:ring-cyan-400/30"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsPasswordVisible((current) => !current)}
                aria-label={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
                // Removed the absolute positioning classes from the button itself
                className="size-8 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200"
              >
                {isPasswordVisible ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="block text-xs tracking-[0.25em] text-cyan-400 uppercase"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={isConfirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              placeholder="********"
              className="h-11 rounded-lg border-cyan-500/60 bg-black pr-12 text-cyan-100 placeholder:text-cyan-800 focus-visible:border-cyan-300 focus-visible:ring-cyan-400/30"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setIsConfirmPasswordVisible((current) => !current)
                }
                aria-label={
                  isConfirmPasswordVisible
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="size-8 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200"
              >
                {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>

          {confirmPasswordMismatch ? (
            <p className="text-xs tracking-wide text-red-300">
              Passwords do not match.
            </p>
          ) : null}
        </div>

        <div className="space-y-1 rounded-lg border border-cyan-500/20 bg-black/40 p-3 text-xs tracking-wide text-gray-300">
          Password must contain at least:
          <span
            className={
              passwordChecks.hasMinLength ? "text-green-400" : "text-gray-400"
            }
          >
            {" "}
            8 characters,
          </span>
          <span
            className={
              passwordChecks.hasLowercase ? "text-green-400" : "text-gray-400"
            }
          >
            {" "}
            1 lowercase letter,
          </span>
          <span
            className={
              passwordChecks.hasUppercase ? "text-green-400" : "text-gray-400"
            }
          >
            {" "}
            1 uppercase letter,
          </span>
          <span
            className={
              passwordChecks.hasNumber ? "text-green-400" : "text-gray-400"
            }
          >
            {" "}
            1 number,
          </span>
          <span
            className={
              passwordChecks.hasSpecial ? "text-green-400" : "text-gray-400"
            }
          >
            {" "}
            1 special character,
          </span>
        </div>

        {errorMessage ? (
          <p className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-xs tracking-wider text-red-300">
            {errorMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="outline"
          disabled={signupMutation.isPending}
          className="w-full border-cyan-400 bg-transparent py-5 text-sm font-bold uppercase tracking-widest text-cyan-300 hover:bg-cyan-400 hover:text-black hover:border-cyan-300"
        >
          {signupMutation.isPending ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>

      <p className="text-white">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-400 underline">
          Log In
        </Link>
      </p>
    </>
  );
}
