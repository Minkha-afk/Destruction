"use client"

import type React from "react"

import { motion, useSpring } from "framer-motion"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps {
  children: React.ReactNode
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export default function AnimatedButton({
  children,
  variant = "default",
  size = "default",
  className,
  onClick,
  disabled = false,
  type = "button",
}: AnimatedButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Spring animations
  const springConfig = { damping: 15, stiffness: 300 }
  const scale = useSpring(1, springConfig)
  const rotateXSpring = useSpring(0, springConfig)
  const rotateYSpring = useSpring(0, springConfig)

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = event.clientX - centerX
    const mouseY = event.clientY - centerY

    rotateXSpring.set(mouseY * 0.1)
    rotateYSpring.set(mouseX * 0.1)
  }

  const handleMouseEnter = () => {
    if (disabled) return
    setIsHovered(true)
    scale.set(1.03)
  }

  const handleMouseLeave = () => {
    if (disabled) return
    setIsHovered(false)
    scale.set(1)
    rotateXSpring.set(0)
    rotateYSpring.set(0)
  }

  const handleMouseDown = () => {
    if (disabled) return
    setIsPressed(true)
    scale.set(0.98)
  }

  const handleMouseUp = () => {
    if (disabled) return
    setIsPressed(false)
    scale.set(isHovered ? 1.03 : 1)
  }

  const handleClick = () => {
    if (disabled) return

    // Particle burst effect
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Create particle elements
      for (let i = 0; i < 6; i++) {
        const particle = document.createElement("div")
        particle.className = "fixed w-1 h-1 bg-primary rounded-full pointer-events-none z-50"
        particle.style.left = `${centerX}px`
        particle.style.top = `${centerY}px`
        document.body.appendChild(particle)

        const angle = (i / 6) * Math.PI * 2
        const distance = 30 + Math.random() * 20
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance

        particle.animate(
          [
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 },
          ],
          {
            duration: 600,
            easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          },
        ).onfinish = () => {
          document.body.removeChild(particle)
        }
      }
    }

    onClick?.()
  }

  return (
    <motion.div
      style={{
        scale,
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
      }}
      className="magnetic"
    >
      <Button
        ref={ref}
        variant={variant}
        size={size}
        type={type}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/20 before:to-accent/20",
          "before:translate-x-[-100%] before:transition-transform before:duration-300",
          "hover:before:translate-x-0",
          "hover:shadow-lg hover:shadow-primary/25 hover:shadow-glow",
          isPressed && "shadow-inner",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        disabled={disabled}
      >
        <span className="relative z-10">{children}</span>

        {/* Ripple effect */}
        {isPressed && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-full"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </Button>
    </motion.div>
  )
}
