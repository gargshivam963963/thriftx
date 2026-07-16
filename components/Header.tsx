'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingBag, User, LogOut, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white/70 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-[#e5e5e5] flex justify-between items-center px-5 md:px-16 h-20">
        <button 
          aria-label="Menu" 
          className="md:hidden p-2 -ml-2 text-black hover:opacity-70 transition-opacity"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/shop/men" className="text-[#616363] hover:text-black transition-colors text-xs font-semibold tracking-widest uppercase">MEN</Link>
          <Link href="/shop/women" className="text-[#616363] hover:text-black transition-colors text-xs font-semibold tracking-widest uppercase">WOMEN</Link>
          <Link href="/shop/vintage" className="text-[#616363] hover:text-black transition-colors text-xs font-semibold tracking-widest uppercase">VINTAGE</Link>
        </div>
        <Link href="/" className="font-serif text-3xl md:text-4xl font-bold tracking-tighter text-black flex-1 text-center md:flex-none uppercase">
          THRIFTX
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/cart" aria-label="Cart" className="text-black hover:opacity-70 transition-opacity flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </Link>
          <button aria-label="Search" className="hidden md:block text-black hover:opacity-70 transition-opacity">
            <Search className="w-6 h-6" />
          </button>
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-widest">{user.name || 'User'}</span>
              <button onClick={logout} aria-label="Log Out" className="text-black hover:opacity-70 transition-opacity">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" aria-label="Account" className="hidden md:block text-black hover:opacity-70 transition-opacity">
              <User className="w-6 h-6" />
            </Link>
          )}
          <button aria-label="Search Mobile" className="md:hidden text-black hover:opacity-70 transition-opacity">
            <Search className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col pt-20 px-5 pb-8 overflow-y-auto">
          <button 
            className="absolute top-6 left-5 p-2 -ml-2 text-black hover:opacity-70 transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <nav className="flex flex-col gap-6 mt-8">
            <Link href="/shop/men" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif text-black uppercase">Men</Link>
            <Link href="/shop/women" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif text-black uppercase">Women</Link>
            <Link href="/shop/vintage" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif text-black uppercase">Vintage</Link>
          </nav>

          <div className="mt-auto flex flex-col gap-4 border-t border-[#e5e5e5] pt-6">
            {user ? (
              <>
                <span className="text-sm font-semibold uppercase tracking-widest text-[#616363]">Hi, {user.name || 'User'}</span>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 text-black font-semibold text-lg"
                >
                  <LogOut className="w-5 h-5" /> Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-black font-semibold text-lg">
                  <User className="w-5 h-5" /> Login
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-black font-semibold text-lg">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
