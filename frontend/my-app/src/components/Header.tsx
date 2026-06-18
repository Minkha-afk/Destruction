"use client"
import Link from "next/link"
import { useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import AnimatedButton from "./AnimatedButton"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Features", href: "#features", description: "Discover our amazing features" },
 // { name: "Gallery", href: "#gallery", description: "View our stunning gallery" },
  //{ name: "Pricing", href: "#pricing", description: "Choose your perfect plan" },
  { name: "FAQ", href: "#faq", description: "Get answers to common questions" },
  { name: "Contact", href: "#contact", description: "Get in touch with us" },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { scrollY } = useScroll()

  // Header transformations based on scroll
  const headerY = useTransform(scrollY, [0, 100], [0, -10])
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98])
  const headerBlur = useTransform(scrollY, [0, 100], [8, 24])
  const headerOpacity = useTransform(scrollY, [0, 100], [0.7, 0.9])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
  }

  return (
    <TooltipProvider>
      <motion.header
        style={{
          y: headerY,
          scale: headerScale,
        }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <motion.div
          style={{
            backdropFilter: `blur(${headerBlur}px) saturate(200%) brightness(120%)`,
            backgroundColor: `rgba(10, 10, 10, ${headerOpacity})`,
          }}
          className="nav-frost rounded-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/3 pointer-events-none rounded-2xl" />

          <div className="container mx-auto px-6 py-4 relative z-10">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">E</span>
                  </div>
                  <span className="font-space-grotesk font-bold text-xl text-foreground">Elevana</span>
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <NavigationMenu>
                  <NavigationMenuList className="space-x-2">
                    {navItems.map((item) => (
                      <NavigationMenuItem key={item.name}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <NavigationMenuLink
                              className={cn(
                                "group inline-flex h-10 w-max items-center justify-center rounded-md",
                                "px-4 py-2 text-sm font-medium transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                                "disabled:pointer-events-none disabled:opacity-50",
                                "relative overflow-hidden cursor-pointer",
                              )}
                              onClick={() => scrollToSection(item.href)}
                            >
                              <span className="relative z-10">{item.name}</span>
                              <motion.div
                                className="absolute bottom-0 left-0 h-0.5 bg-primary"
                                initial={{ width: 0 }}
                                whileHover={{ width: "100%" }}
                                transition={{ duration: 0.2 }}
                              />
                            </NavigationMenuLink>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              {/* Desktop CTAs */}
              <div className="hidden md:flex items-center space-x-4">
                <AnimatedButton variant="ghost" size="sm" onClick={() => scrollToSection("#features")}>
                  Learn More
                </AnimatedButton>
                <Link href="/auth"><AnimatedButton size="sm">Get Started</AnimatedButton></Link>
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <motion.button
                      className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </motion.button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 glassmorphism border-border/20">
                    <div className="flex flex-col space-y-6 mt-8">
                      {navItems.map((item, index) => (
                        <motion.button
                          key={item.name}
                          className="text-left p-4 rounded-lg hover:bg-accent/10 transition-colors"
                          onClick={() => scrollToSection(item.href)}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="font-medium text-foreground">{item.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                        </motion.button>
                      ))}

                      <div className="flex flex-col space-y-3 pt-6 border-t border-border/20">
                        <AnimatedButton variant="ghost" className="w-full" onClick={() => scrollToSection("#features")}>
                          Learn More
                        </AnimatedButton>
                        <Link href="/auth"> <AnimatedButton className="w-full">Get Started</AnimatedButton></Link>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.header>
    </TooltipProvider>
  )
}
