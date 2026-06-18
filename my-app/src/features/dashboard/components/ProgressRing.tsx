"use client"

import { useId } from "react"
import { motion } from "framer-motion"

export function ProgressRing({
    size = 96,
    strokeWidth = 10,
    progress = 0,
}: {
    size?: number
    strokeWidth?: number
    progress?: number
}) {
    const safeProgress = Math.max(0, Math.min(100, progress))
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - safeProgress / 100)
    const gradId = useId()
    const glowId = useId()

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-[0_0_14px_rgba(99,102,241,0.35)] -rotate-90"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
                <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {/* Track */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-white/8"
            />
            {/* Animated progress */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                filter={`url(#${glowId})`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
        </svg>
    )
}
