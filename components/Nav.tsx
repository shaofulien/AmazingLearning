"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "首頁" },
  { href: "/lesson", label: "上課中" },
  { href: "/vocabulary", label: "單字與錯題本" },
  { href: "/review", label: "複習" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2">
        <Link href="/" className="mr-4 text-base font-bold text-sky-700">
          🎓 Amazing Learning
        </Link>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              pathname === l.href
                ? "bg-sky-100 font-medium text-sky-800"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
