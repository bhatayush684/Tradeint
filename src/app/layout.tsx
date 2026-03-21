import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClerkProvider>
          <header className="p-4 border-b flex justify-between items-center">
            <h1 className="text-xl font-bold">Tradient</h1>
            <div>
              <Show when="signed-out">
                <div className="flex gap-4">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-opacity hover:opacity-90">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 border rounded-md transition-colors hover:bg-accent">Sign Up</button>
                  </SignUpButton>
                </div>
              </Show>
              <Show when="signed-in">
                <UserButton afterSignOutUrl="/" />
              </Show>
            </div>
          </header>
          <main>
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}
