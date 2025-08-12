"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}