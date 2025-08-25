'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

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

  return (
    <nav className="relative bg-gradient-to-r from-[#A29BFE] via-[#A29BFE] to-[#55EFC4] shadow-lg">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-xl font-bold text-white hover:text-gray-100 transition-colors"
        >
          BudEvent
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-white hover:text-gray-100 transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/events" 
            className="text-white hover:text-gray-100 transition-colors"
          >
            Events
          </Link>
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#2D3436] bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#2D3436] bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
            >
              Sign in
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
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
        >
          <svg
            className="h-5 w-5 text-white"
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
          className="absolute left-0 right-0 top-full z-50 rounded-xl border border-gray-200 bg-white p-2 shadow-lg md:hidden"
        >
          <div className="space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Home
            </Link>
            <Link
              href="/events"
              className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Events
            </Link>
            {session ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-sm text-gray-700 border-b border-gray-200">
                  Welcome, {session.user?.name || session.user?.email}
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
