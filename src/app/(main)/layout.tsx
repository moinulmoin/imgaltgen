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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto flex-1">
        <Navbar isUserLoggedIn={isUserLoggedIn} />
        {children}
      </div>
      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Built by{" "}
          <a 
            href="https://moinulmoin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Moinul Moin
          </a>
          {" "}for fun
        </p>
      </footer>
    </div>
  );
}