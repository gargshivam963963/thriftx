'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { account } from '@/lib/appwrite';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await account.createEmailPasswordSession(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 mt-32 mb-24 flex flex-col items-center">
      <h1 className="font-serif text-4xl font-bold text-black mb-2 text-center uppercase tracking-widest">Welcome Back</h1>
      <p className="text-[#7e7576] font-sans text-sm mb-10 text-center">Sign in to access your curated archive.</p>
      
      {error && (
        <div className="w-full bg-red-50 text-red-500 text-sm p-4 rounded-xl mb-6 text-center border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">Email Address</label>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black focus:ring-0 outline-none transition-colors" 
            required 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">Password</label>
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black focus:ring-0 outline-none transition-colors" 
            required 
          />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="rounded border-[#7e7576] text-black focus:ring-black w-4 h-4 bg-transparent group-hover:border-black transition-colors" />
            <span className="font-sans text-sm text-[#4c4546] group-hover:text-black transition-colors">Remember me</span>
          </label>
          <Link href="#" className="text-xs font-semibold tracking-widest uppercase text-[#4c4546] hover:text-black underline underline-offset-4">Forgot Password?</Link>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white font-sans text-lg font-medium py-5 rounded-2xl hover:bg-black/90 transition-opacity flex justify-center items-center gap-3 mt-4 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>

      <div className="mt-10 flex flex-col items-center gap-4 w-full border-t border-[#e5e5e5] pt-8">
        <p className="font-sans text-sm text-[#4c4546]">Don&apos;t have an account?</p>
        <Link href="/signup" className="w-full border-2 border-black text-black font-sans text-lg font-medium py-4 rounded-2xl hover:bg-[#f3f3f3] transition-colors flex justify-center items-center">
          Create an Account
        </Link>
      </div>
    </div>
  );
}
