'use client';
import { useState } from 'react';
import TryOnModal from './TryOnModal';

export default function ProductTryOnButton({ productImage, productName = '' }: { productImage: string; productName?: string }) {
  const [openAi, setOpenAi] = useState(false);
  const [openOriginal, setOpenOriginal] = useState(false);

  return (
    <>
      <div className="absolute bottom-6 right-6 bg-white/70 backdrop-blur-xl rounded-full p-1.5 flex items-center gap-1 border border-white/50 shadow-lg">
        <button onClick={() => setOpenOriginal(true)} className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-black text-white transition-all">Original</button>
        <button onClick={() => setOpenAi(true)} className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase text-[#4c4546] hover:bg-white/50 transition-all flex items-center gap-2">
          AI Model
        </button>
      </div>

      {(
        <TryOnModal isOpen={openAi} productImage={productImage} productName={productName} onClose={() => setOpenAi(false)} />
      )}

      {openOriginal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpenOriginal(false)} />
          <div className="relative z-10 max-w-4xl w-full p-4">
            <img src={productImage || '/assets/placeholder.png'} alt="original" className="w-full h-auto rounded-lg shadow-lg" />
            <div className="flex justify-end mt-3">
              <button onClick={() => setOpenOriginal(false)} className="px-4 py-2 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
