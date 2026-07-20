"use client";

export default function UploadProgress() {
    return (
        <div className="rounded-2xl border bg-white p-6">

            <div className="flex items-center justify-between">

                <div>

                    <h2 className="text-xl font-semibold">
                        Upload Progress
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        Track bulk upload progress.
                    </p>

                </div>

                <span className="text-sm font-medium">
                    128 / 300
                </span>

            </div>

            <div className="mt-6 h-4 overflow-hidden rounded-full bg-neutral-200">

                <div
                    className="h-full rounded-full bg-black"
                    style={{ width: "43%" }}
                />

            </div>

            <div className="mt-4 flex justify-between text-sm text-neutral-500">

                <span>
                    Uploading TX128...
                </span>

                <span>
                    43%
                </span>

            </div>

            <div className="mt-6 flex gap-3">

                <button className="rounded-xl border px-4 py-2 hover:bg-neutral-100">
                    View Logs
                </button>

                <button className="rounded-xl bg-black px-4 py-2 text-white hover:bg-neutral-800">
                    Download Report
                </button>

            </div>

        </div>
    );
}