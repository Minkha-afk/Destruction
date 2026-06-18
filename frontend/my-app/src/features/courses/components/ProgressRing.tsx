"use client"

import { useId } from "react"

export function ProgressRing({
    value,
    size = 44,
    strokeWidth = 6,
}: {
    value: number
    size?: number
    strokeWidth?: number
}) {
    const gradientId = useId()
    const pct = Math.max(0, Math.min(100, value))
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (pct / 100) * circumference
    const complete = pct >= 100

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="-rotate-90 overflow-visible"
                role="img"
                aria-label={`${Math.round(pct)} percent complete`}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        {complete ? (
                            <>
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="#10b981" />
                            </>
                        ) : (
                            <>
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="55%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#22d3ee" />
                            </>
                        )}
                    </linearGradient>
                </defs>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-white/8"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                    style={{
                        filter: complete
                            ? "drop-shadow(0 0 5px rgba(16,185,129,0.55))"
                            : "drop-shadow(0 0 5px rgba(99,102,241,0.55))",
                    }}
                />
            </svg>
            <span
                className="absolute font-display font-semibold tabular-nums text-foreground"
                style={{ fontSize: Math.max(9, size * 0.26) }}
            >
                {Math.round(pct)}
                <span className="opacity-60" style={{ fontSize: Math.max(7, size * 0.16) }}>%</span>
            </span>
        </div>
    )
}
