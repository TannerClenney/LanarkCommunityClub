"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isOfficer =
    session?.user?.role === "OFFICER" || session?.user?.role === "ADMIN";

  return (
    <nav className="bg-green-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wide hover:text-green-200 transition-colors">
          🌳 Lanark Community Club
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/about" className="hover:text-green-200 transition-colors">About</Link>
          <Link href="/events" className="hover:text-green-200 transition-colors">Events</Link>
          <Link href="/projects" className="hover:text-green-200 transition-colors">Projects</Link>
          <Link href="/coming-soon" className="hover:text-green-200 transition-colors">Scholarships</Link>
          <Link href="/coming-soon" className="hover:text-green-200 transition-colors">Gallery</Link>
          <Link href="/coming-soon" className="hover:text-green-200 transition-colors">Contact</Link>
          <Link href="/donate" className="bg-yellow-500 text-green-900 px-4 py-1 rounded-full font-bold hover:bg-yellow-400 transition-colors">
            Donate
          </Link>

          {session ? (
            <>
              <Link href="/dashboard" className="hover:text-green-200 transition-colors">Members</Link>
              {isOfficer && (
                <Link href="/admin" className="hover:text-green-200 transition-colors">Admin</Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:text-green-200 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-green-200 transition-colors">Sign in</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-900 px-4 pb-4 flex flex-col gap-3 text-sm font-medium">
          <Link href="/about" onClick={() => setMenuOpen(false)} className="hover:text-green-200">About</Link>
          <Link href="/events" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Events</Link>
          <Link href="/projects" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Projects</Link>
          <Link href="/coming-soon" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Scholarships</Link>
          <Link href="/coming-soon" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Gallery</Link>
          <Link href="/coming-soon" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Contact</Link>
          <Link href="/donate" onClick={() => setMenuOpen(false)} className="hover:text-green-200 font-bold text-yellow-400">Donate</Link>
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Members Area</Link>
              {isOfficer && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Admin</Link>
              )}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left hover:text-green-200">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="hover:text-green-200">Sign in</Link>
          )}
        </div>
      )}
    </nav>
  );
}
