"use client";

import { Upload, Sparkles, ImagePlus } from "lucide-react";
import Image from "next/image";

interface UploadDropzoneProps {
    images: File[];
    previews: string[];
    isGenerating: boolean;
    onImageChange: (
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;
    onAIFill: () => void;
}

export default function UploadDropzone({
    images,
    previews,
    isGenerating,
    onImageChange,
    onAIFill,
}: UploadDropzoneProps) {
    return (
        <section className="rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-8 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-neutral-100 p-3">
                        <ImagePlus size={22} />
                    </div>

                    <div>

                        <h2 className="text-xl font-semibold">
                            Product Images
                        </h2>

                        <p className="text-sm text-neutral-500">
                            Upload multiple high quality product images.
                        </p>

                    </div>

                </div>

                <button
                    type="button"
                    disabled={isGenerating}
                    onClick={onAIFill}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-black
                        px-5
                        py-3
                        text-white
                        transition
                        hover:bg-neutral-800
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <Sparkles size={18} />

                    {isGenerating
                        ? "Generating..."
                        : "AI Fill"}
                </button>

            </div>

            <label
                className="
                    group
                    flex
                    min-h-[260px]
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center
                    rounded-3xl
                    border-2
                    border-dashed
                    border-neutral-300
                    bg-neutral-50
                    transition-all
                    duration-300
                    hover:border-black
                    hover:bg-neutral-100
                "
            >

                <Upload
                    size={46}
                    className="
                        mb-5
                        text-neutral-500
                        transition-transform
                        duration-300
                        group-hover:-translate-y-1
                    "
                />

                <h3 className="text-lg font-semibold">
                    Click or Drag Images
                </h3>

                <p className="mt-2 text-sm text-neutral-500">
                    PNG • JPG • JPEG • WEBP
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                    Multiple image upload supported
                </p>

                <input
                    hidden
                    multiple
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                />

            </label>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4">

                <div>

                    <h4 className="font-medium">
                        Uploaded Images
                    </h4>

                    <p className="text-sm text-neutral-500">
                        {images.length} image
                        {images.length !== 1 ? "s" : ""}
                        {" "}selected
                    </p>

                </div>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                    {images.length}
                </span>

            </div>

            {previews.length > 0 && (

                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">

                    {previews.map((preview, index) => (

                        <div
                            key={index}
                            className="
                                overflow-hidden
                                rounded-2xl
                                border
                                border-neutral-200
                                bg-neutral-100
                            "
                        >
                            <Image
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                width={300}
                                height={300}
                                unoptimized
                                className="aspect-square h-full w-full object-cover transition duration-300 hover:scale-105"
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}