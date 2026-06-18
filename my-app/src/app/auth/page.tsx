"use client"

import { AuthBackground, AuthForm } from "@/features/auth"
import "./auth-styles.css"

export default function AuthPage() {
  return (
    <AuthBackground>
      <AuthForm defaultMode="login" />
    </AuthBackground>
  )
}
