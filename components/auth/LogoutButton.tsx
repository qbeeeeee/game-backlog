"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface LogoutButtonProps {
  className?: string;
  label?: string;
}

export function LogoutButton({ className, label = "Exit" }: LogoutButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const avatarItemRef = useRef<HTMLLIElement>(null);

  const [openModal, setOpenModal] = useState(false);

  const profile = {
    firstName: "Kyuubi",
    lastName: "Player",
    imageUrl: "",
  };

  const initials = `${profile.firstName?.charAt(0) ?? ""}${
    profile.lastName?.charAt(0) ?? ""
  }`
    .toUpperCase()
    .trim();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: async () => {
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!avatarItemRef.current) {
        return;
      }

      if (!avatarItemRef.current.contains(event.target as Node)) {
        setOpenModal(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      <li ref={avatarItemRef} className="relative cursor-pointer">
        {openModal ? (
          <div className="absolute bottom-full left-0 z-50 mb-2 w-44 max-w-[calc(100vw-1rem)] rounded-lg border border-purple-300/30 bg-gray-900/95 p-3 shadow-xl backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">
              Signed in as
            </p>
            <p className="mt-1 text-xs font-semibold text-white">
              {profile.firstName} {profile.lastName}
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                className="text-xs font-semibold text-white underline"
                href="/profile"
              >
                Profile
              </Link>

              <Link
                className="text-xs font-semibold text-white underline"
                href="/dashboard"
              >
                Dashboard
              </Link>
            </div>
            <div className="absolute left-4 top-full h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-purple-300/30 bg-gray-900/95" />
          </div>
        ) : null}
        <Avatar
          onClick={() => setOpenModal((prev) => !prev)}
          className="size-9 border border-purple-300/30"
        >
          <AvatarImage
            src={profile.imageUrl || undefined}
            alt={`${profile.firstName} ${profile.lastName}`}
          />
          <AvatarFallback>{initials || "U"}</AvatarFallback>
        </Avatar>
      </li>
      <li>
        <Button
          type="button"
          variant="ghost"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className={`px-3 text-xs uppercase tracking-widest text-gray-300 hover:text-white hover:bg-transparent ${className ?? ""}`}
        >
          {logoutMutation.isPending ? "Logging out..." : label}
        </Button>
      </li>
    </>
  );
}
