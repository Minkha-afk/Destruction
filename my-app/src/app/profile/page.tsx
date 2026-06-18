"use client"

import { Suspense, useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, Shield, Calendar, Edit3, Save, X, Sparkles, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/features/dashboard"
import { useAuth } from "@/features/auth"
import { apiFetch, API_BASE_URLS } from "@/lib/api-config"
import { setAuthToken } from "@/lib/token"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import "@/styles/global.css"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty")
      return
    }
    try {
      setSaving(true)
      const res = await apiFetch<{ user: { id: number; name: string; email: string; role: string; createdAt: string }; token: string }>(
        "/auth/profile",
        { method: "PATCH", body: JSON.stringify({ name: name.trim() }) },
        API_BASE_URLS.auth
      )
      // Store fresh token
      setAuthToken(res.token)
      // Update auth context so the name change reflects everywhere immediately
      updateUser({ name: res.user.name })
      toast.success("Profile updated!")
      setEditing(false)
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const roleBadgeClass =
    user?.role === "teacher"
      ? "bg-violet-600/20 text-violet-300 border border-violet-600/40"
      : "bg-indigo-600/20 text-indigo-300 border border-indigo-600/40"

  const isTeacher = user?.role === "teacher"
  const avatarInitial = user?.name?.[0]?.toUpperCase() ?? "U"
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—"
  const memberYear = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric" })
    : "—"

  const statTiles = [
    {
      icon: Shield,
      label: "Role",
      value: user?.role ?? "learner",
      capitalize: true,
      tint: isTeacher ? "text-violet-300" : "text-indigo-300",
      ring: isTeacher ? "ring-violet-500/25" : "ring-indigo-500/25",
    },
    {
      icon: Calendar,
      label: "Member Since",
      value: memberYear,
      capitalize: false,
      tint: "text-cyan-300",
      ring: "ring-cyan-500/25",
    },
    {
      icon: BadgeCheck,
      label: "Account",
      value: "Active",
      capitalize: false,
      tint: "text-emerald-300",
      ring: "ring-emerald-500/25",
    },
  ]

  return (
    <div className="aurora-bg grid-overlay min-h-screen bg-background text-foreground overflow-x-hidden">
      <aside
        aria-label="Sidebar navigation"
        className="fixed left-0 top-0 h-full w-72 p-4 sidebar-glass z-10"
      >
        <Suspense>
          <Sidebar />
        </Suspense>
      </aside>

      <main className="ml-72 p-8 min-h-screen scrollbar-thin">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <span className="chip mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Your space
            </span>
            <h1 className="text-4xl font-display font-bold text-gradient">Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your personal information and identity</p>
          </motion.header>

          {/* Hero identity card */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="card-premium mb-6 overflow-hidden"
          >
            {/* Gradient banner */}
            <div className="relative h-28 sm:h-32 w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-violet-600/30 to-cyan-500/20" />
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(40% 80% at 15% 20%, rgba(99,102,241,0.5), transparent 60%), radial-gradient(45% 90% at 85% 30%, rgba(139,92,246,0.45), transparent 60%)",
                }}
              />
            </div>

            <div className="px-6 sm:px-8 pb-7">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 sm:-mt-14">
                {/* Avatar with gradient ring */}
                <div className="relative shrink-0">
                  <div className="rounded-full p-[3px] bg-gradient-to-br from-indigo-400 via-violet-500 to-cyan-400 shadow-glow">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-background flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-4xl sm:text-5xl font-display font-bold text-white select-none">
                        {avatarInitial}
                      </div>
                    </div>
                  </div>
                  <span
                    className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-background"
                    aria-label="Active account"
                    title="Active"
                  />
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-gradient truncate">
                      {user?.name ?? "—"}
                    </h2>
                    <Badge className={cn("text-xs capitalize", roleBadgeClass)}>
                      {user?.role ?? "learner"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1.5 flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user?.email ?? "—"}</span>
                  </p>
                  <p className="text-muted-foreground/80 text-xs mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    Member since {memberSince}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Stat tiles */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.07, delayChildren: 0.14 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          >
            {statTiles.map((tile) => {
              const Icon = tile.icon
              return (
                <motion.div
                  key={tile.label}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="neu hover-lift rounded-xl p-4 flex items-center gap-3.5"
                >
                  <span
                    className={cn(
                      "grid place-items-center w-11 h-11 rounded-xl glass-subtle ring-1",
                      tile.ring,
                      tile.tint
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                      {tile.label}
                    </p>
                    <p className={cn("text-base font-semibold truncate", tile.capitalize && "capitalize")}>
                      {tile.value}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Account details + inline edit */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="card-premium border-0 bg-transparent shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-display font-semibold">Account Details</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your display name is visible across Elevana.
                  </p>
                </div>
                {!editing ? (
                  <Button
                    size="sm"
                    variant="glass"
                    className="gap-1.5"
                    onClick={() => { setName(user?.name ?? ""); setEditing(true) }}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="glow"
                      onClick={handleSave}
                      disabled={saving}
                      className="gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={() => setEditing(false)}
                      aria-label="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-1 pt-2">
                {/* Name */}
                <div className="space-y-2 rounded-xl px-4 py-4 glass-subtle">
                  <Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wide">
                    <User className="w-3.5 h-3.5" /> Display Name
                  </Label>
                  {editing ? (
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="neu-inset border-0 max-w-sm h-10 focus-visible:ring-indigo-500/40"
                      placeholder="Your name"
                      aria-label="Display name"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    />
                  ) : (
                    <p className="text-sm font-medium">{user?.name ?? "—"}</p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2 rounded-xl px-4 py-4">
                  <Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wide">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Label>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {user?.email ?? "—"}
                    <span className="chip text-[0.65rem]">Verified</span>
                  </p>
                </div>

                {/* Role (read-only) */}
                <div className="space-y-2 rounded-xl px-4 py-4 glass-subtle">
                  <Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wide">
                    <Shield className="w-3.5 h-3.5" /> Role
                  </Label>
                  <p className="text-sm font-medium capitalize">{user?.role ?? "learner"}</p>
                </div>

                {/* Member since */}
                <div className="space-y-2 rounded-xl px-4 py-4">
                  <Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5" /> Member Since
                  </Label>
                  <p className="text-sm font-medium">{memberSince}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
