"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, GraduationCap, Users, Lightbulb, Sparkles, AlertCircle } from "lucide-react"
import { useAuth } from "../composables/useAuth"
import { useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/token"
import { decodeJWT } from "@/lib/cookies"
import type { AuthMode, UserRole } from "../types"

interface AuthFormProps {
    defaultMode?: AuthMode;
}

export function AuthForm({ defaultMode = "login" }: AuthFormProps) {
    const [mode, setMode] = useState<AuthMode>(defaultMode)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "" as UserRole | "",
    })
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { login, register } = useAuth()
    const router = useRouter()

    // Route by role: teachers land in their studio, learners on the dashboard.
    // We read the freshly-stored token (context `user` updates async after login).
    const routeByRole = (fallbackRole?: string) => {
        const token = getAuthToken()
        const decoded: any = token ? decodeJWT(token) : null
        const role = String(decoded?.role ?? decoded?.user?.role ?? fallbackRole ?? "learner").toLowerCase()
        router.push(role === "teacher" ? "/admin" : "/dashboard")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            if (mode === "login") {
                await login(formData.email, formData.password)
                routeByRole()
            } else {
                if (!formData.name || !formData.role) {
                    throw new Error("Name and role are required for registration")
                }
                await register(formData.name, formData.email, formData.password, formData.role as UserRole)
                routeByRole(formData.role as string)
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <div className="auth-content">
            <div className="w-full max-w-md">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-center mb-4">
                        <motion.div
                            className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <GraduationCap className="w-8 h-8 text-white" />
                        </motion.div>
                    </div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        Elevana
                    </h1>
                    <p className="text-white/70 text-lg">
                        {mode === "login" ? "Continue your learning journey" : "Start your educational adventure"}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:shadow-glow">
                        <CardHeader className="space-y-1 pb-6">
                            <CardTitle className="text-2xl font-bold text-center text-white">
                                {mode === "login" ? "Welcome Back" : "Join Elevana"}
                            </CardTitle>
                            <CardDescription className="text-center text-white/60">
                                {mode === "login"
                                    ? "Enter your credentials to access your account"
                                    : "Fill in your details to get started"}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-200"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <AnimatePresence mode="wait">
                                    {mode === "register" && (
                                        <motion.div
                                            key="name-field"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-white/90">
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent/50 transition-all duration-200"
                                                    required
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white/90">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent/50 transition-all duration-200"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white/90">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent focus:ring-accent/50 transition-all duration-200"
                                        required
                                    />
                                </div>

                                <AnimatePresence mode="wait">
                                    {mode === "register" && (
                                        <motion.div
                                            key="role-field"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="role" className="text-white/90">
                                                    I am a...
                                                </Label>
                                                <Select
                                                    value={formData.role}
                                                    onValueChange={(value: UserRole) => handleInputChange("role", value)}
                                                >
                                                    <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-accent focus:ring-accent/50 transition-all duration-200">
                                                        <SelectValue placeholder="Select your role" className="text-white/50" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card/95 backdrop-blur-xl border-white/20">
                                                        <SelectItem value="learner" className="text-white hover:bg-white/10">
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen className="w-4 h-4" />
                                                                <span>Learner</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="teacher" className="text-white hover:bg-white/10">
                                                            <div className="flex items-center gap-2">
                                                                <Users className="w-4 h-4" />
                                                                <span>Teacher</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-white text-black hover:bg-white/90 font-semibold py-3 transition-all duration-200 hover:shadow-lg hover:shadow-white/20 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <motion.span
                                        key={mode}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                                            />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                        {isSubmitting ? "Processing..." : (mode === "login" ? "Sign In" : "Create Account")}
                                    </motion.span>
                                </Button>
                            </form>

                            {/* Switch Mode */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-white/60">
                                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                                </p>
                                <Button
                                    variant="link"
                                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                                    className="text-accent hover:text-accent/80 font-semibold p-0 h-auto mt-1 hover:shadow-glow white-text"
                                >
                                    {mode === "login" ? "Create one here" : "Sign in instead"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    className="mt-8 grid grid-cols-3 gap-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div className="flex flex-col items-center space-y-3">
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-white/70 font-medium">Interactive Learning</span>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-white/70 font-medium">Expert Teachers</span>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                            <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-white/70 font-medium">Personalized Path</span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
