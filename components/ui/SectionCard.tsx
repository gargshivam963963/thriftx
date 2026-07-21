// "use client";

// import { ChevronDown } from "lucide-react";
// import { motion } from "framer-motion";
// import { useState } from "react";
// import GlassCard from "./ui/GlassCard";

// interface Props {
//     title: string;
//     description: string;
//     icon: React.ReactNode;
//     children: React.ReactNode;
//     defaultOpen?: boolean;
// }

// export default function SectionCard({
//     title,
//     description,
//     icon,
//     children,
//     defaultOpen = true,
// }: Props) {
//     const [open, setOpen] =
//         useState(defaultOpen);

//     return (
//         <GlassCard className="overflow-hidden">

//             <button
//                 onClick={() => setOpen(!open)}
//                 type="button"
//                 className="flex w-full items-center justify-between p-6"
//             >
//                 <div className="flex items-center gap-4">

//                     <div className="rounded-2xl bg-neutral-100 p-3">

//                         {icon}

//                     </div>

//                     <div className="text-left">

//                         <h2 className="font-semibold text-xl">

//                             {title}

//                         </h2>

//                         <p className="text-sm text-neutral-500">

//                             {description}

//                         </p>

//                     </div>

//                 </div>

//                 <motion.div
//                     animate={{
//                         rotate: open ? 180 : 0,
//                     }}
//                 >
//                     <ChevronDown />
//                 </motion.div>

//             </button>

//             <motion.div
//                 initial={false}
//                 animate={{
//                     height: open ? "auto" : 0,
//                     opacity: open ? 1 : 0,
//                 }}
//                 className="overflow-hidden"
//             >
//                 <div className="border-t border-neutral-200 p-6">

//                     {children}

//                 </div>

//             </motion.div>

//         </GlassCard>
//     );
// }