"use client"

import "@/styles/global.css";
import { motion, useScroll, useTransform, easeOut } from "framer-motion"
import { Star, Zap, Shield, Rocket, ChevronDown } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AnimatedButton from "@/components/AnimatedButton"

// Features data
const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance with cutting-edge technology for instant results.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security measures.",
  },
  {
    icon: Rocket,
    title: "Easy Integration",
    description: "Seamlessly integrate with your existing workflow in minutes.",
  },
  {
    icon: Star,
    title: "Premium Quality",
    description: "Professional-grade results that exceed your expectations.",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Get instant feedback and live updates as you work.",
  },
  {
    icon: Shield,
    title: "24/7 Support",
    description: "Round-the-clock assistance from our expert team.",
  },
]

// FAQ data
const faqItems = [
  {
    question: "How does the animation system work?",
    answer:
      "Our animation system uses advanced Three.js technology combined with Framer Motion to create smooth, performant animations that work across all devices and browsers.",
  },
  {
    question: "Can I customize the animations?",
    answer:
      "You have full control over timing, easing, and visual effects. Our intuitive interface makes it easy to create custom animations without coding.",
  },
  {
    question: "Is it mobile-friendly?",
    answer:
      "Yes, all animations are optimized for mobile devices with automatic performance scaling and reduced motion support for accessibility.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "We support all major image formats (JPG, PNG, GIF, WebP) and video formats (MP4, WebM). Files up to 100MB are supported on Pro plans.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not satisfied with our service, contact us for a full refund.",
  },
]


function Page() {
  const { scrollYProgress } = useScroll();

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const featuresY = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "-20%"]);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: easeOut },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div
      className="min-h-screen text-foreground overflow-x-hidden bg-gradient-to-b from-[#050714] via-[#0a0d2e] to-[#07081a]"
    >
      <Header />

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center px-6 pt-24 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/background.png)' }}
      >
        {/* Gradient overlay at bottom to blend image into background */}
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-32 md:h-48"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(10, 19, 49, 0.95) 100%)',
            zIndex: 2,
          }}
        />
        <motion.div style={{ y: heroY }} className="container mx-auto text-center max-w-4xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={fadeInUp.transition}>
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm glassmorphism">
              ✨ Serenity
            </Badge>

            <h1 className="font-space-grotesk font-bold text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
             Lessons That 
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
               Inspire Discovery.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
             From traditional learning to a journey of curiosity and growth.
            </p>
          </motion.div>

          {/* UploadDropzone removed as per user request */}

          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
  <section id="features" className="py-24 px-6 bg-transparent">
        <motion.div style={{ y: featuresY }} className="container mx-auto">
          <motion.div className="text-center mb-16" initial={fadeInUp.initial} animate={fadeInUp.animate} transition={fadeInUp.transition}>
            <h2 className="font-space-grotesk font-bold text-3xl md:text-5xl mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create professional animations and interactive experiences.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Card className="h-full glassmorphism border-border/20 hover:border-primary/20 transition-colors duration-300 hover:shadow-xl hover:shadow-primary/20 hover:shadow-glow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-space-grotesk">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ Section */}
  <section id="faq" className="py-24 px-6 bg-transparent">
        <div className="container mx-auto max-w-3xl">
          <motion.div className="text-center mb-16" initial={fadeInUp.initial} animate={fadeInUp.animate} transition={fadeInUp.transition}>
            <h2 className="font-space-grotesk font-bold text-3xl md:text-5xl mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about our platform.</p>
          </motion.div>

          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={fadeInUp.transition}>
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="glassmorphism border border-border/20 rounded-lg px-6"
                >
                  <AccordionTrigger className="font-space-grotesk font-medium text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
  <section id="contact" className="py-24 px-6 bg-transparent">
        <div className="container mx-auto text-center max-w-2xl">
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={fadeInUp.transition}>
            <h2 className="font-space-grotesk font-bold text-3xl md:text-5xl mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of Learners and Teachers building amazing courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <AnimatedButton size="lg" className="text-lg px-8">
                  Get Started
                </AnimatedButton>
              </Link>
              
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <Toaster />
    </div>
  )
}

export default Page;
