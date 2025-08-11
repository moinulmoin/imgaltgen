"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LoginButton() {
const router = useRouter();

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/login")}
      >
        Login
      </Button>
    );
}