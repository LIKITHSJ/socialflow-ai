"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  UserCheck,
  Settings,
  LogIn,
  UserPlus,
  Link as LinkIcon,
  PenLine,
  MessageSquare,
  AtSign
} from "lucide-react";
const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
  { name: "Analytics", href: "/analytics", icon: <BarChart3 /> },
  { name: "Calendar", href: "/calendar", icon: <Calendar /> },
  { name: "Create Post", href: "/create-post", icon: <PenLine /> },
  { name: "Messages", href: "/messages", icon: <MessageSquare /> },
  { name: "Mentions", href: "/mentions", icon: <AtSign /> },
  { name: "Accounts", href: "/accounts", icon: <LinkIcon /> },
  { name: "Team", href: "/team", icon: <UserCheck /> },
  { name: "Settings", href: "/settings", icon: <Settings /> },
  { name: "Login", href: "/login", icon: <LogIn /> },
  { name: "Signup", href: "/signup", icon: <UserPlus /> }
];
export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 text-white p-6 shadow-xl flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-wide">SocialFlow</h1>
      <nav className="flex flex-col gap-2 mt-4">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                ${
                  active
                    ? "bg-white text-neutral-900 shadow-md font-semibold"
                    : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}