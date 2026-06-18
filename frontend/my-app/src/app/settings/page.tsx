"use client"

import { Suspense, useState } from "react"
import { motion } from "framer-motion"
import {
  Bell,
  Lock,
  Palette,
  Globe,
  LogOut,
  Trash2,
  ShieldCheck,
  Moon,
  Check,
  AlertTriangle,
  KeyRound,
  Settings as SettingsIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sidebar } from "@/features/dashboard"
import { useAuth } from "@/features/auth"
import { authAPI } from "@/api/auth-api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import "@/styles/global.css"

export default function SettingsPage() {
  const { logout } = useAuth()
  const [securityBusy, setSecurityBusy] = useState(false)

  // Notification preferences (local only for now)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [progressNotifs, setProgressNotifs] = useState(true)
  const [marketingNotifs, setMarketingNotifs] = useState(false)

  const handleChangePassword = async () => {
    const currentPassword = window.prompt("Enter current password")
    if (!currentPassword) return

    const newPassword = window.prompt("Enter new password (min 6 chars)")
    if (!newPassword) return

    try {
      setSecurityBusy(true)
      await authAPI.changePassword({ currentPassword, newPassword })
      toast.success("Password changed successfully")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to change password"
      toast.error(message)
    } finally {
      setSecurityBusy(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("This will permanently delete your account. Continue?")
    if (!confirmed) return

    const password = window.prompt("Enter your password to confirm account deletion")
    if (!password) return

    try {
      setSecurityBusy(true)
      await authAPI.deleteAccount({ password })
      logout()
      toast.success("Account deleted")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete account"
      toast.error(message)
    } finally {
      setSecurityBusy(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success("Signed out successfully")
  }

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
              <SettingsIcon className="w-3.5 h-3.5" />
              Preferences
            </span>
            <h1 className="text-4xl font-display font-bold text-gradient">Settings</h1>
            <p className="text-muted-foreground mt-2">Configure your experience and account</p>
          </motion.header>

          <div className="space-y-6">
            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
              <Card className="card-premium border-0 bg-transparent shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2.5 text-base font-display font-semibold">
                    <span className="grid place-items-center w-8 h-8 rounded-lg glass-subtle ring-1 ring-indigo-500/25 text-indigo-300">
                      <Bell className="w-4 h-4" />
                    </span>
                    Notifications
                  </CardTitle>
                  <CardDescription>Choose what updates you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SettingToggle
                    id="email-notifs"
                    label="Email notifications"
                    hint="Course updates and announcements"
                    checked={emailNotifs}
                    onToggle={() => setEmailNotifs((v) => !v)}
                  />
                  <Separator className="opacity-10" />
                  <SettingToggle
                    id="progress-notifs"
                    label="Progress reminders"
                    hint="Weekly learning streak reminders"
                    checked={progressNotifs}
                    onToggle={() => setProgressNotifs((v) => !v)}
                  />
                  <Separator className="opacity-10" />
                  <SettingToggle
                    id="marketing-notifs"
                    label="Marketing emails"
                    hint="New courses and promotions"
                    checked={marketingNotifs}
                    onToggle={() => setMarketingNotifs((v) => !v)}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Appearance */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-0 bg-transparent shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2.5 text-base font-display font-semibold">
                    <span className="grid place-items-center w-8 h-8 rounded-lg glass-subtle ring-1 ring-violet-500/25 text-violet-300">
                      <Palette className="w-4 h-4" />
                    </span>
                    Appearance
                  </CardTitle>
                  <CardDescription>Theme is set to dark mode by default</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="neu-inset rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600/30 to-violet-600/20 text-violet-200">
                        <Moon className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">Deep Space</p>
                        <p className="text-xs text-muted-foreground">
                          Additional theme options coming soon
                        </p>
                      </div>
                    </div>
                    <span className="chip">
                      <Check className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Language */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
              <Card className="card-premium border-0 bg-transparent shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2.5 text-base font-display font-semibold">
                    <span className="grid place-items-center w-8 h-8 rounded-lg glass-subtle ring-1 ring-cyan-500/25 text-cyan-300">
                      <Globe className="w-4 h-4" />
                    </span>
                    Language &amp; Region
                  </CardTitle>
                  <CardDescription>Interface language: English (US)</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Multi-language support is planned for a future release.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
              <Card className="card-premium border-0 bg-transparent shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2.5 text-base font-display font-semibold">
                    <span className="grid place-items-center w-8 h-8 rounded-lg glass-subtle ring-1 ring-amber-500/25 text-amber-300">
                      <Lock className="w-4 h-4" />
                    </span>
                    Security
                  </CardTitle>
                  <CardDescription>Keep your account protected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="neu-inset rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="grid place-items-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/25 to-amber-600/10 text-amber-200 shrink-0">
                        <KeyRound className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">Password</p>
                        <p className="text-xs text-muted-foreground">
                          Use at least 6 characters. A strong password mixes letters, numbers, and symbols.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="glass"
                      className="w-full sm:w-auto shrink-0 gap-2"
                      onClick={handleChangePassword}
                      disabled={securityBusy}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {securityBusy ? "Please wait..." : "Change Password"}
                    </Button>
                  </div>

                  {/* Password strength guidance */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      "6+ characters",
                      "Letters & numbers",
                      "A unique secret",
                    ].map((tip) => (
                      <div
                        key={tip}
                        className="glass-subtle rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Danger zone */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
              <div className="relative rounded-[var(--radius-xl)] overflow-hidden">
                {/* red hairline + glow frame */}
                <div
                  className="absolute inset-0 rounded-[var(--radius-xl)] pointer-events-none"
                  style={{
                    padding: "1px",
                    background:
                      "linear-gradient(140deg, rgba(244,63,94,0.55), rgba(244,63,94,0.12) 45%, transparent 75%)",
                    WebkitMask:
                      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />
                <div className="glass-strong rounded-[var(--radius-xl)] bg-[rgba(40,10,16,0.45)]">
                  <div className="p-6">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="grid place-items-center w-8 h-8 rounded-lg bg-rose-500/15 ring-1 ring-rose-500/30 text-rose-300">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                      <h3 className="text-base font-display font-semibold text-rose-300">Danger Zone</h3>
                    </div>
                    <p className="text-xs text-muted-foreground ml-[2.875rem] mb-5">
                      Irreversible actions. Please proceed with caution.
                    </p>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 neu-inset rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <LogOut className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Sign out</p>
                            <p className="text-xs text-muted-foreground">End your session on this device.</p>
                          </div>
                        </div>
                        <Button
                          variant="glass"
                          className="gap-2 w-full sm:w-auto shrink-0"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-4 bg-rose-500/[0.06] ring-1 ring-rose-500/20">
                        <div className="flex items-start gap-3">
                          <Trash2 className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-rose-200">Delete account</p>
                            <p className="text-xs text-muted-foreground">
                              Permanently remove your account and all associated data.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          className="gap-2 w-full sm:w-auto shrink-0 bg-rose-900/50 hover:bg-rose-900/80 border border-rose-700/50 text-rose-50"
                          onClick={handleDeleteAccount}
                          disabled={securityBusy}
                        >
                          <Trash2 className="w-4 h-4" />
                          {securityBusy ? "Please wait..." : "Delete Account"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ── Presentational toggle row (self-contained, no external logic) ── */
function SettingToggle({
  id,
  label,
  hint,
  checked,
  onToggle,
}: {
  id: string
  label: string
  hint: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="text-sm cursor-pointer flex-col items-start gap-0.5">
        <span>{label}</span>
        <span className="block text-xs text-muted-foreground font-normal">{hint}</span>
      </Label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
          "outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked
            ? "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_14px_rgba(99,102,241,0.45)]"
            : "bg-slate-600/70"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  )
}
