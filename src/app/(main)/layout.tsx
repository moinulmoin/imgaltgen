import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session from the server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isUserLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <Navbar isUserLoggedIn={isUserLoggedIn} />
        {children}
      </div>
    </div>
  );
}