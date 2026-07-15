'use client';
import { useState, useRef } from 'react';
import { X, Upload, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string;
  productName: string;
}

export default function TryOnModal({ isOpen, onClose, productImage, productName }: TryOnModalProps) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!userImage || !productImage) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImage: userImage,
          productImage: productImage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResultImage(data.resultUrl || data.imageUrl || null);
      } else {
        setError(data.error || 'Failed to generate try-on image');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-[32px] overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors text-black">
          <X className="w-5 h-5" />
        </button>

        <div className="w-full md:w-1/2 bg-[#f3f3f3] p-8 flex flex-col items-center justify-center border-r border-[#e5e5e5]">
          <h3 className="font-serif text-2xl mb-2 text-center text-black">Your Photo</h3>
          <p className="text-sm text-[#7e7576] mb-8 text-center font-sans">Upload a full body or half body photo facing forward.</p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-[#cfc4c5] hover:border-black transition-colors cursor-pointer flex flex-col items-center justify-center relative overflow-hidden bg-white",
              userImage && "border-none"
            )}
          >
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="User" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="w-10 h-10 text-[#a99e9f] mb-4" />
                <span className="text-sm font-semibold tracking-widest uppercase text-black">Click to Upload</span>
              </>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

          {userImage && (
            <button onClick={() => fileInputRef.current?.click()} className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#4c4546] hover:text-black">
              Change Photo
            </button>
          )}
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center relative bg-white">
          <h3 className="font-serif text-2xl mb-2 text-center text-black">AI Try-On</h3>
          <p className="text-sm text-[#7e7576] mb-8 text-center font-sans">See how {productName} looks on you.</p>

          <div className="w-full aspect-[3/4] rounded-2xl relative overflow-hidden bg-[#f3f3f3] border border-[#e5e5e5] flex items-center justify-center">
            {resultImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resultImage} alt="Try On Result" className="w-full h-full object-cover" />
            ) : loading ? (
              <div className="flex flex-col items-center gap-4 text-black">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-sans">AI is weaving magic...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-[#a99e9f] opacity-50 p-8 text-center">
                <Sparkles className="w-10 h-10" />
                <span className="text-sm font-sans">Upload your photo and click try on to see the result here.</span>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

          <button
            onClick={handleTryOn}
            disabled={!userImage || loading}
            className="w-full mt-6 bg-black text-white font-sans text-base font-semibold py-4 rounded-xl hover:bg-black/90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Processing...' : 'Virtual Try-On'}
          </button>
        </div>
      </div>
    </div>
  );
}
