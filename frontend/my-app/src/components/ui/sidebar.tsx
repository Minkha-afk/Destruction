"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Home, BookOpen, Compass, Award, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Courses", href: "/courses" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: Award, label: "Achievements", href: "/achievements" },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
]

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "tween" as const,
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
  closed: {
    x: "-100%",
    transition: {
      type: "tween" as const,
      duration: 0.15,
      ease: "easeIn" as const,
    },
  },
}

const itemVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.1,
      ease: "easeOut" as const,
    },
  },
  closed: {
    x: -10,
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: "easeIn" as const,
    },
  },
}

const overlayVariants = {
  open: {
    opacity: 1,
    transition: { duration: 0.1 },
  },
  closed: {
    opacity: 0,
    transition: { duration: 0.1 },
  },
}

interface AnimatedSidebarProps {
  className?: string
}

export function AnimatedSidebar({ className }: AnimatedSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Toggle Button: Menu (top-left when closed), Cross (top-right in sidebar when open) */}
      {!isOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200",
            "dark:bg-gray-900/90 dark:border-gray-700",
            className,
          )}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed left-0 top-0 h-screen w-80 z-40 lg:relative lg:z-0"
          >
            {/* Close button inside sidebar */}
            <motion.button
              onClick={toggleSidebar}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute top-4 right-4 z-50 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ outline: "none" }}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </motion.button>

            <div className="h-screen w-full bg-white dark:bg-white border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              {/* Header */}
              <motion.div variants={itemVariants} className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      LearnHub
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Learning Platform</p>
                  </div>
                </div>
              </motion.div>

              {/* Navigation */}
              <nav className="p-6 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <a
                      href={item.href}
                      className="flex items-center gap-4 p-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50 hover:shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900/50 dark:group-hover:to-purple-900/50 transition-all duration-200 shadow-sm">
                        <item.icon className="h-5 w-5 group-hover:scale-105 transition-transform duration-200" />
                      </div>
                      <span className="font-medium text-base group-hover:translate-x-1 transition-transform duration-200">
                        {item.label}
                      </span>
                    </a>
                  </motion.div>
                ))}
              </nav>

              {/* Footer */}
              <motion.div variants={itemVariants} className="absolute bottom-6 left-6 right-6">
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      JD
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">John Doe</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Premium Student</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  )
}
