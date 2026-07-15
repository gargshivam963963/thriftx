'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 mt-32 mb-24 flex flex-col items-center">
      <h1 className="font-serif text-4xl font-bold text-black mb-2 text-center uppercase tracking-widest">Join ThriftX</h1>
      <p className="text-[#7e7576] font-sans text-sm mb-10 text-center">Create an account to track your grails.</p>
      
      {error && (
        <div className="w-full bg-red-50 text-red-500 text-sm p-4 rounded-xl mb-6 text-center border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="w-full flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">Full Name</label>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black focus:ring-0 outline-none transition-colors" 
            required 
          />
        </div>
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
        
        <p className="font-sans text-xs text-[#7e7576] mt-2 leading-relaxed">
          By creating an account, you agree to our <Link href="#" className="text-black underline underline-offset-2">Terms of Service</Link> and <Link href="#" className="text-black underline underline-offset-2">Privacy Policy</Link>.
        </p>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white font-sans text-lg font-medium py-5 rounded-2xl hover:bg-black/90 transition-opacity flex justify-center items-center gap-3 mt-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4 w-full">
        <p className="font-sans text-sm text-[#4c4546]">
          Already have an account? <Link href="/login" className="text-black font-semibold hover:underline underline-offset-4">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
