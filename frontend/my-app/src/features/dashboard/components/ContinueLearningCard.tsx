"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Play, BookMarked } from "lucide-react"
import type { Lesson } from "../types"

export function ContinueLearningCard({ lesson }: { lesson: Lesson }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="card-premium group h-full overflow-hidden p-0"
        >
            <div className="relative h-36 w-full overflow-hidden">
                <Image
                    src={lesson.thumbnail || "/images/courses/react-foundations.jpg"}
                    alt={`${lesson.course} thumbnail`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a18] via-[#0b0a18]/40 to-transparent" />

                <span className="chip absolute left-4 top-4 backdrop-blur-md">
                    <BookMarked className="h-3 w-3" aria-hidden="true" />
                    Continue Learning
                </span>

                <div className="absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-full glass-strong text-xs font-semibold tabular-nums">
                    <span className="text-gradient-cyan">{lesson.progress}%</span>
                </div>
            </div>

            <div className="p-5">
                <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-300/90">{lesson.course}</p>
                    <h3 className="font-display text-sm font-semibold text-pretty leading-snug">{lesson.levelTitle}</h3>
                </div>

                <div className="mt-4">
                    <Progress
                        value={lesson.progress}
                        className="progress h-2 overflow-hidden bg-white/10"
                    />
                    <div className="mt-1.5 text-xs text-muted-foreground">{lesson.progress}% complete</div>
                </div>

                <Button
                    asChild
                    variant="glow"
                    className="mt-4 w-full rounded-xl"
                >
                    <Link href={lesson.href || "/courses"}>
                        <Play className="h-4 w-4" />
                        {lesson.actionLabel || "Resume Course"}
                    </Link>
                </Button>
            </div>
        </motion.div>
    )
}
