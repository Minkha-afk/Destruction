"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Lock, Layers, Tag, Star, Users, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import type { ExploreCourse } from "../types"

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/)
    return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase()
}

const DIFFICULTY_COLORS: Record<string, string> = {
    beginner:     "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    intermediate: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    advanced:     "bg-rose-500/15 text-rose-300 border-rose-500/30",
}

const item = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0 },
}

type Props = {
    course: ExploreCourse
    index?: number
    loading?: boolean
    isEnrolled?: boolean
    onPurchase?: (course: ExploreCourse) => void
}

export default function ExploreCard({ course, loading = false, isEnrolled = false, onPurchase }: Props) {
    const diffKey = course.difficulty?.toLowerCase() ?? ""
    const diffClass = DIFFICULTY_COLORS[diffKey] ?? "bg-muted/30 text-muted-foreground border-muted/40"

    return (
        <motion.div
            variants={item}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="group h-full"
        >
            <Card
                className="card-premium relative h-full flex flex-col overflow-hidden gap-0 border-0 py-0 bg-transparent shadow-none"
                aria-label={`Course card for ${course.title}`}
            >
                {/* Thumbnail */}
                <div className="relative h-44 sm:h-48 overflow-hidden shrink-0">
                    <img
                        src={course.image || "/images/courses/react-foundations.jpg"}
                        alt={`${course.title} cover`}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                    {/* Cinematic gradient veil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />
                    {/* Indigo wash that intensifies on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-violet-500/0 transition-colors duration-500 group-hover:from-indigo-500/15 group-hover:to-violet-500/10 pointer-events-none" />

                    {/* Top-left meta: locked + difficulty */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/45 backdrop-blur-md text-white/90 px-2 py-1 text-[0.7rem] font-medium ring-1 ring-white/10">
                            <Lock className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Locked</span>
                        </span>
                        {course.difficulty && (
                            <Badge className={`text-[0.7rem] border backdrop-blur-md ${diffClass} capitalize`}>
                                {course.difficulty}
                            </Badge>
                        )}
                    </div>

                    {/* Rating chip */}
                    {course.rating && (
                        <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-md text-amber-300 px-2 py-1 text-[0.7rem] font-semibold ring-1 ring-amber-300/20">
                            <Star className="h-3 w-3 fill-current" />
                            {course.rating.toFixed(1)}
                        </div>
                    )}

                    {/* Category pill floating on the cover bottom */}
                    {course.category && (
                        <div className="absolute bottom-3 left-3">
                            <span className="chip max-w-[12rem] truncate">{course.category}</span>
                        </div>
                    )}
                </div>

                <CardHeader className="px-5 pt-4 pb-2 flex-none">
                    <div className="flex items-center justify-end gap-3">
                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Layers className="h-3.5 w-3.5 text-indigo-300/80" />
                            <span>{course.levels} levels</span>
                        </div>
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold leading-tight line-clamp-2 text-foreground transition-colors duration-300 group-hover:text-gradient">
                        {course.title}
                    </h3>
                </CardHeader>

                <CardContent className="px-5 pt-0 flex-1">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0 ring-1 ring-indigo-500/25">
                            <AvatarFallback className="text-xs bg-indigo-500/15 text-indigo-200">{getInitials(course.instructor)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground truncate">{course.instructor}</span>
                    </div>

                    <p className="mt-2.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {course.description}
                    </p>

                    <div className="mt-3.5 flex items-center justify-between">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1">
                            <Tag className="h-3.5 w-3.5 text-indigo-300" />
                            <span className="text-sm font-semibold text-indigo-200">{course.price}</span>
                        </div>
                        {course.totalStudents != null && (
                            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                {course.totalStudents.toLocaleString()}
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="px-5 pb-5 pt-3 flex-none">
                    <Button
                        variant={isEnrolled ? "glass" : "glow"}
                        className="w-full rounded-xl font-medium group/btn disabled:opacity-70 disabled:cursor-not-allowed"
                        onClick={() => onPurchase?.(course)}
                        disabled={loading || isEnrolled}
                        aria-label={isEnrolled ? `Already enrolled in ${course.title}` : `Enroll in ${course.title}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Enrolling…
                            </>
                        ) : isEnrolled ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" /> Already Enrolled
                            </>
                        ) : (
                            <>
                                Enroll Now
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
