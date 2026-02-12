"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"

interface AuthModalProps {
    children?: React.ReactNode
    defaultView?: "login" | "register" | "forgot-password"
}

type AuthView = "login" | "register" | "forgot-password"

export function AuthModal({ children, defaultView = "login" }: AuthModalProps) {
    const [view, setView] = useState<AuthView>(defaultView)
    const [open, setOpen] = useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Reset to default view when closed
            setTimeout(() => setView(defaultView), 200)
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
