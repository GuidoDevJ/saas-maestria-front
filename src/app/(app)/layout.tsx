import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "./components/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
