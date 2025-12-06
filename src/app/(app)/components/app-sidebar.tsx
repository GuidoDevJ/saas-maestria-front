"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookCopy, LayoutDashboard, LogOut, Settings, UserCircle, Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/upload", icon: Upload, label: "Subir Documentos" },
  ];

  return (
    <aside className="w-64 flex-col border-r bg-card p-4 flex">
      <div className="flex items-center gap-2 pb-6 border-b">
        <BookCopy className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">Versioned Docs</h1>
      </div>

      <nav className="flex-1 mt-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Button
                asChild
                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <div className="p-2 rounded-lg bg-background">
            {user && (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold">{user.username}</span>
                        <Badge variant="outline" className="w-fit">{user.role}</Badge>
                    </div>
                </div>
            )}
        </div>
        <Button variant="ghost" className="w-full justify-start mt-2" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
