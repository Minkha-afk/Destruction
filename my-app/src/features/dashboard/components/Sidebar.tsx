"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Home,
    BookOpen,
    Search,
    Settings,
    Moon,
    Sun,
    MessageCircle,
    LogOut,
    UserCircle,
    ClipboardList,
    ShieldCheck,
    Lightbulb,
    GraduationCap,
} from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useAuth } from "@/features/auth/composables/useAuth"

const nav = [
    { id: "dashboard",     label: "Dashboard",    icon: Home,          href: "/dashboard" },
    { id: "courses",       label: "Courses",       icon: BookOpen,      href: "/courses" },
    { id: "explore",       label: "Explore",       icon: Search,        href: "/explore" },
    { id: "quiz-history",  label: "Quiz History",  icon: ClipboardList, href: "/quiz-history" },
    { id: "chat",          label: "Chat",          icon: MessageCircle, href: "/chat" },
    { id: "profile",       label: "Profile",       icon: UserCircle,    href: "/profile" },
    { id: "settings",      label: "Settings",      icon: Settings,      href: "/settings" },
]

const teacherNav = [
    { id: "admin",         label: "Admin Panel",  icon: ShieldCheck,   href: "/admin" },
]

export function Sidebar() {
    const { theme, setTheme } = useTheme()
    const pathname = usePathname()
    const { logout, user } = useAuth()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U'
    const roleLabel = user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : 'Guest'

    return (
        <aside className="flex h-full flex-col">
            {/* Brand */}
            <Link href="/dashboard" className="mb-5 flex items-center gap-2.5 px-1">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-glow">
                    <GraduationCap className="h-5 w-5 text-white" />
                </span>
                <span className="font-display text-lg font-bold tracking-tight text-gradient">Elevana</span>
            </Link>

            {/* Header with avatar + theme toggle */}
            <div className="glass-subtle flex items-center justify-between rounded-2xl p-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="relative shrink-0">
                        <span
                            aria-hidden="true"
                            className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 opacity-70 blur-[5px]"
                        />
                        <Avatar className="relative h-10 w-10 ring-2 ring-white/15">
                            <AvatarImage src="/diverse-avatars.png" alt={user?.name ?? 'User avatar'} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">{initials}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{user?.name ?? 'Loading...'}</p>
                        <span className="chip mt-0.5 px-2 py-0 text-[10px] capitalize">{roleLabel}</span>
                    </div>
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    className="relative shrink-0 rounded-full hover:bg-white/10 hover:shadow-glow"
                    aria-label="Toggle theme"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
            </div>

            {/* Navigation */}
            <nav className="mt-6 flex-1 overflow-y-auto scrollbar-thin" aria-label="Primary">
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Menu
                </p>
                <ul className="flex flex-col gap-1">
                    {nav.map((item, idx) => {
                        const Icon = item.icon
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                        return (
                            <motion.li
                                key={item.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.04, ease: "easeOut" }}
                            >
                                <Link href={item.href} passHref>
                                    <div
                                        className={cn(
                                            "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                                            "transition-all duration-200",
                                            isActive
                                                ? "glass-active text-foreground"
                                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                                        )}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        {isActive && (
                                            <motion.span
                                                layoutId="sidebar-active-indicator"
                                                aria-hidden="true"
                                                className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500 shadow-glow"
                                            />
                                        )}
                                        <Icon
                                            className={cn(
                                                "h-4 w-4 shrink-0 transition-colors",
                                                isActive ? "text-indigo-300" : "text-foreground/70 group-hover:text-indigo-300",
                                            )}
                                        />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                </Link>
                            </motion.li>
                        )
                    })}

                    {/* Admin nav – visible only for teachers */}
                    {user?.role?.toLowerCase() === "teacher" && (
                        <>
                            <li className="mx-2 my-2 border-t border-white/8" />
                            <li>
                                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-amber-300/70">
                                    Teacher
                                </p>
                            </li>
                            {teacherNav.map((item) => {
                                const Icon = item.icon
                                const isActive =
                                    pathname === item.href ||
                                    pathname.startsWith(`${item.href}/`)
                                return (
                                    <li key={item.id}>
                                        <Link href={item.href} passHref>
                                            <div
                                                className={cn(
                                                    "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                                                    "transition-all duration-200",
                                                    isActive
                                                        ? "glass-active text-foreground"
                                                        : "text-amber-200/80 hover:bg-amber-500/10 hover:text-amber-100",
                                                )}
                                                aria-current={isActive ? "page" : undefined}
                                            >
                                                <Icon className="h-4 w-4 shrink-0 text-amber-400" />
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </div>
                                        </Link>
                                    </li>
                                )
                            })}
                        </>
                    )}
                </ul>
            </nav>

            {/* Sidebar Tip */}
            <div className="gradient-border mt-6 p-3.5">
                <div className="flex items-start gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-500/25 to-orange-500/15 text-amber-300">
                        <Lightbulb className="h-4 w-4" />
                    </span>
                    <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                        Keep your learning streak alive for bonus achievements!
                    </p>
                </div>
            </div>

            {/* Logout Button */}
            <div className="mt-4 border-t border-white/8 pt-4">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300/90 transition-colors hover:bg-rose-500/12 hover:text-rose-200"
                    aria-label="Logout"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </Button>
            </div>
        </aside>
    )
}
