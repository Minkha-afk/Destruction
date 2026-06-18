"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ChevronRight, Sparkles, ArrowUpRight } from "lucide-react"
import type { Recommendation } from "../types"

export function RecommendationsCarousel({ items }: { items: Recommendation[] }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="card-premium p-5"
        >
            <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-cyan-500/25 to-indigo-500/15 text-cyan-300">
                        <Sparkles className="h-4 w-4" />
                    </span>
                    Recommended for you
                </h3>
                <Button variant="glass" size="sm" className="gap-1 rounded-full">
                    View all
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="mt-5 overflow-x-auto scrollbar-thin pb-2">
                <div className="flex min-w-max gap-4 pr-2">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.16 + idx * 0.07, ease: "easeOut" }}
                            whileHover={{ y: -6 }}
                            className="group w-[268px] overflow-hidden rounded-2xl glass-subtle transition-colors duration-300 hover:border-indigo-400/40"
                        >
                            <div className="relative h-32 w-full overflow-hidden">
                                <Image
                                    src={item.thumbnail || "/images/courses/react-foundations.jpg"}
                                    alt={`${item.title} thumbnail`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a18] via-[#0b0a18]/30 to-transparent" />
                                <Badge className="absolute left-3 top-3 rounded-full border border-indigo-500/30 bg-indigo-500/20 text-[11px] font-semibold text-indigo-100 backdrop-blur-md">
                                    {item.category}
                                </Badge>
                                <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full glass-strong text-indigo-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <ArrowUpRight className="h-4 w-4" />
                                </span>
                            </div>
                            <div className="p-4">
                                <p className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">by {item.instructor}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    )
}
