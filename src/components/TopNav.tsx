'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut, getSession } from 'next-auth/react';

export default function TopNav() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMenuOpen]);

  // Trap focus within menu when open
  useEffect(() => {
    if (isMenuOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Custom sign-out function that handles Google sign-out
  const handleSignOut = async () => {
    try {
      // Sign out from NextAuth with redirect to Google sign-out
      // This will clear both BudEvent session and Google session
      await signOut({ 
        callbackUrl: '/',
        redirect: true
      });
      
      // Force Google sign-out by redirecting to Google's logout page
      // This ensures the user is completely signed out from Google
      setTimeout(() => {
        const googleSignOutUrl = `https://accounts.google.com/Logout?continue=${encodeURIComponent(window.location.origin)}`;
        window.location.href = googleSignOutUrl;
      }, 100);
      
    } catch (error) {
      console.error('Error during sign out:', error);
      // Fallback to normal sign out
      await signOut({ callbackUrl: '/' });
    }
  };

  // Check if user is admin
  const isAdmin = (user: { email?: string | null }) => {
    const adminEmails = ['admin@budevent.com', 'timohl@hotmail.com'];
          return user.email ? adminEmails.includes(user.email) : false;
  };

  return (
    <nav className="relative bg-[#111827] border-b border-[#374151] shadow-lg">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <img 
            src="/BudEvent-pin.svg" 
            alt="BudEvent Logo" 
            className="h-14 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {session ? (
            <>
              <Link 
                href="/" 
                className="text-[#F3F4F6] hover:text-[#DB2777] transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/events" 
                className="text-[#F3F4F6] hover:text-[#DB2777] transition-colors"
              >
                Events
              </Link>
            </>
          ) : null}
          {session && (
            <Link 
              href="/dashboard" 
              className="text-[#F3F4F6] hover:text-[#DB2777] transition-colors"
            >
              Dashboard
            </Link>
          )}
          {session && session.user && isAdmin(session.user) && (
            <Link 
              href="/admin" 
              className="text-[#F3F4F6] hover:text-[#DB2777] transition-colors"
            >
              Admin
            </Link>
          )}
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="text-[#F3F4F6] text-sm">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <button 
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#DB2777] rounded-lg hover:bg-[#BE185D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DB2777] transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#3B82F6] rounded-lg hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6]"
        >
          <svg
            className="h-5 w-5 text-[#F3F4F6]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="absolute left-0 right-0 top-full z-50 rounded-xl border border-[#374151] bg-[#1F2937] p-2 shadow-lg md:hidden"
        >
          <div className="space-y-2">
            {session ? (
              <>
                <Link
                  href="/"
                  className="block px-3 py-2 text-[#F3F4F6] hover:text-[#DB2777] hover:bg-[#374151] rounded-lg transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/events"
                  className="block px-3 py-2 text-[#F3F4F6] hover:text-[#DB2777] hover:bg-[#374151] rounded-lg transition-colors"
                >
                  Events
                </Link>
              </>
            ) : null}
            {session && (
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-[#F3F4F6] hover:text-[#DB2777] hover:bg-[#374151] rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            )}
            {session && session.user && isAdmin(session.user) && (
              <Link
                href="/admin"
                className="block px-3 py-2 text-[#F3F4F6] hover:text-[#DB2777] hover:bg-[#374151] rounded-lg transition-colors"
              >
                Admin
              </Link>
            )}
            {session ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-sm text-[#9CA3AF] border-b border-[#374151]">
                  Welcome, {session.user?.name || session.user?.email}
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-[#DB2777] hover:bg-[#374151] rounded-lg transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="block px-3 py-2 text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] hover:bg-[#374151] rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
