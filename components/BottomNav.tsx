'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Heart, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/shop', icon: Grid, label: 'Shop' },
    { href: '/cart', icon: ShoppingBag, label: 'Cart', badge: true },
    { href: '#', icon: Heart, label: 'Wishlist' },
    user 
      ? { onClick: logout, icon: LogOut, label: 'Logout' }
      : { href: '/login', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="md:hidden bg-white/80 backdrop-blur-xl fixed bottom-0 w-full z-50 rounded-t-2xl border-t border-[#e5e5e5] flex justify-around items-center h-16 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = item.href && pathname === item.href;
        const Icon = item.icon;
        
        if (item.onClick) {
          return (
            <button key={item.label} onClick={item.onClick} className="relative flex flex-col items-center group pt-1">
              <Icon className={cn("w-6 h-6 mb-1 transition-all duration-200", isActive ? "text-black scale-110" : "text-[#616363] group-hover:scale-110 group-hover:text-black")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[10px] font-semibold tracking-wide uppercase transition-colors", isActive ? "text-black" : "text-[#616363]")}>
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <Link key={item.label} href={item.href || '#'} className="relative flex flex-col items-center group pt-1">
            {item.badge && (
              <div className="absolute top-0 right-1/4 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
            )}
            <Icon className={cn("w-6 h-6 mb-1 transition-all duration-200", isActive ? "text-black scale-110" : "text-[#616363] group-hover:scale-110 group-hover:text-black")} strokeWidth={isActive ? 2.5 : 2} />
            <span className={cn("text-[10px] font-semibold tracking-wide uppercase transition-colors", isActive ? "text-black" : "text-[#616363]")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
