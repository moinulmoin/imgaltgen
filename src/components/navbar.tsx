"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { LoginButton } from "./login-button";
import { LogoutButton } from "./logout-button";

interface NavbarProps {
  isUserLoggedIn: boolean;
}

export function Navbar({ isUserLoggedIn }: NavbarProps) {
  return (
    <nav className="flex justify-between p-4">
      <Link href="/" className="font-bold">
        ImgAltGen
      </Link>

      {isUserLoggedIn && (
        <Link href="/history" className="hover:underline underline-offset-4">
          History
        </Link>
      )}

      {isUserLoggedIn ? (
        <LogoutButton />
      ) : (
        <Link href="/login" className={buttonVariants({ variant: "default" })}>
          Login
        </Link>
      )}
    </nav>
  );
}