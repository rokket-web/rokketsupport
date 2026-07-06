"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function LoginMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
      >
        Login
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <Link
            href="/login/client"
            role="menuitem"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Client Login
          </Link>
          <Link
            href="/login/team"
            role="menuitem"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Team Member Login
          </Link>
        </div>
      )}
    </div>
  );
}
