"use client"

import { motion } from "framer-motion"

interface AuthBackgroundProps {
    children?: React.ReactNode;
}

export function AuthBackground({ children }: AuthBackgroundProps) {
    return (
        <>
            <div className="night-background">
                <div className="stars-container">
                    {/* Twinkling stars */}
                    {Array.from({ length: 150 }).map((_, i) => (
                        <motion.div key={`star-${i}`} className="star star-large" />
                    ))}

                    {/* Smaller ambient stars */}
                    {Array.from({ length: 300 }).map((_, i) => (
                        <div key={`small-star-${i}`} className="star star-small" />
                    ))}
                </div>

                {/* Crescent Moon */}
                <motion.div
                    className="crescent-moon"
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                >
                    <div className="moon-glow" />
                    <div className="moon-body" />
                    <div className="moon-shadow" />
                    <div className="moon-crater-1" />
                    <div className="moon-crater-2" />
                    <div className="moon-crater-3" />
                </motion.div>

                {/* City silhouette */}
                <div className="city-silhouette">
                    <div className="building building-1" />
                    <div className="building building-2" />
                    <div className="building building-3" />
                    <div className="building building-4" />
                    <div className="building building-5" />
                    <div className="building building-6" />
                    <div className="building building-7" />

                    {/* Building windows with lights */}
                    <div className="window window-yellow window-1" />
                    <div className="window window-blue window-2" />
                    <div className="window window-yellow window-3" />
                    <div className="window window-blue window-4" />
                    <div className="window window-yellow window-5" />
                    <div className="window window-blue window-6" />
                    <div className="window window-yellow window-7" />
                    <div className="window window-blue window-8" />
                    <div className="window window-yellow window-9" />
                    <div className="window window-blue window-10" />
                    <div className="window window-yellow window-11" />
                    <div className="window window-blue window-12" />
                    <div className="window window-yellow window-13" />
                </div>

                {/* Atmospheric clouds */}
                <motion.div
                    className="atmospheric-cloud-1"
                    animate={{
                        x: [0, 50, 0],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />

                <motion.div
                    className="atmospheric-cloud-2"
                    animate={{
                        x: [0, -30, 0],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 5,
                    }}
                />

                {/* Shooting star */}
                <motion.div
                    className="shooting-star"
                    animate={{
                        x: [0, typeof window !== "undefined" ? window.innerWidth : 1200],
                        y: [0, 150],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeOut",
                        repeatDelay: Math.random() * 15 + 10,
                    }}
                />
            </div>
            {children}
        </>
    )
}
