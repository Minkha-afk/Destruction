"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ArrowUp, Github, Twitter, Linkedin, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import AnimatedButton from "./AnimatedButton"
import { toast } from "sonner"

const footerSections = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Explore", href: "/explore" },
      { name: "Courses", href: "/courses" },
      { name: "Get Started", href: "/auth" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Profile", href: "/profile" },
      { name: "Settings", href: "/settings" },
      { name: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "FAQ", href: "#faq" },
      { name: "Quiz History", href: "/quiz-history" },
      { name: "Auth", href: "/auth" },
      { name: "Home", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy", href: "#contact" },
      { name: "Terms", href: "#faq" },
      { name: "Security", href: "/settings" },
      { name: "Cookies", href: "#contact" },
    ],
  },
]

const socialLinks = [
  { name: "GitHub", icon: Github, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Email", icon: Mail, href: "mailto:hello@elevana.com" },
]

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Thank you for subscribing to our newsletter!")
  }

  return (
    <footer className="relative bg-background/50 backdrop-blur-sm border-t border-border/20">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center space-x-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-space-grotesk font-bold text-xl text-foreground">Elevana</span>
            </motion.div>

            <motion.p
              className="text-muted-foreground mb-6 max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Learn real skills through structured courses, interactive quizzes, and progress you can actually see — or teach your own. Elevana makes learning stick.
            </motion.p>

            {/* Newsletter Signup */}
            <motion.form
              onSubmit={handleNewsletterSubmit}
              className="flex space-x-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-background/50 border-border/40"
                required
              />
              <AnimatedButton type="submit" size="sm">
                Subscribe
              </AnimatedButton>
            </motion.form>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (sectionIndex + 3) }}
            >
              <h3 className="font-space-grotesk font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <Separator className="mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <motion.div
            className="flex items-center space-x-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground text-sm">© 2024 Elevana. All rights reserved.</p>
            <button className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              🌍 English
            </button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon size={18} />
                <span className="sr-only">{social.name}</span>
              </motion.a>
            ))}
          </motion.div>

          {/* Back to Top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowUp size={16} className="mr-1" />
              Back to top
            </AnimatedButton>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
