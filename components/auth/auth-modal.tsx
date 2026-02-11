"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

interface AuthModalProps {
    children?: React.ReactNode
}

type AuthView = "login" | "register" | "forgot-password"

export function AuthModal({ children }: AuthModalProps) {
    const [view, setView] = useState<AuthView>("login")
    const [open, setOpen] = useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Reset to login view when closed (optional, but good UX usually)
            setTimeout(() => setView("login"), 200)
        }
    }

    const renderContent = () => {
        switch (view) {
            case "login":
                return (
                    <LoginForm
                        onSwitchToRegister={() => setView("register")}
                        onSwitchToForgotPassword={() => setView("forgot-password")}
                        onClose={() => setOpen(false)}
                    />
                )
            case "register":
                return <RegisterForm onSwitchToLogin={() => setView("login")} onClose={() => setOpen(false)} />
            case "forgot-password":
                return <ForgotPasswordForm onSwitchToLogin={() => setView("login")} onClose={() => setOpen(false)} />
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className="sm:max-w-[425px] bg-[#0f111a] border-[#1e2330] text-white p-6 rounded-xl"
                onInteractOutside={(e) => e.preventDefault()}
            >
                {renderContent()}
            </DialogContent>
        </Dialog>
    )
}
