"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    identifier: z.string().min(1, "Vui lòng nhập email"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
})

interface LoginFormProps {
    onSwitchToRegister: () => void
    onSwitchToForgotPassword: () => void
    onClose: () => void
}

export function LoginForm({
    onSwitchToRegister,
    onSwitchToForgotPassword,
    onClose,
}: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: values.identifier,
                password: values.password,
            })

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Đăng nhập thất bại",
                    description: error.message,
                })
                return
            }

            toast({
                variant: "success",
                title: "Thành công",
                description: "Đăng nhập thành công",
            })

            router.refresh()
            onClose()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Lỗi hệ thống",
                description: "Đã có lỗi xảy ra, vui lòng thử lại sau"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    ĐĂNG NHẬP
                </h1>
                <p className="text-sm text-muted-foreground">Chào mừng trở lại</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="identifier"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">
                                    Email <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="Nhập email"
                                            className="bg-[#1e2330] border-gray-700 pl-8 text-white placeholder:text-gray-500"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                                        >
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••••••"
                                            className="bg-[#1e2330] border-gray-700 pl-8 pr-10 text-white placeholder:text-gray-500"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                                        >
                                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full bg-[#00b4d8] hover:bg-[#0096c7] text-white font-bold py-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ĐANG XỬ LÝ
                            </>
                        ) : (
                            "ĐĂNG NHẬP"
                        )}
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                        <button
                            type="button"
                            className="text-gray-400 hover:text-white transition-colors"
                            onClick={onSwitchToForgotPassword}
                            disabled={isLoading}
                        >
                            Quên mật khẩu?
                        </button>
                        <button
                            type="button"
                            className="text-gray-400 hover:text-white transition-colors"
                            onClick={onSwitchToRegister}
                            disabled={isLoading}
                        >
                            Tạo tài khoản
                        </button>
                    </div>
                </form>
            </Form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0f111a] px-2 text-gray-400">
                        HOẶC ĐĂNG NHẬP BẰNG
                    </span>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <Button
                    variant="outline"
                    className="rounded-full bg-[#1e2330] border-0 hover:bg-[#2a3040] w-12 h-12 p-0 flex items-center justify-center"
                    disabled={isLoading}
                >
                    {/* Google Icon Placeholder or SVG */}
                    <span className="text-xl">G</span>
                </Button>
                <Button
                    variant="outline"
                    className="rounded-full bg-[#1e2330] border-0 hover:bg-[#2a3040] w-12 h-12 p-0 flex items-center justify-center"
                    disabled={isLoading}
                >
                    {/* Discord Icon Placeholder or SVG */}
                    <span className="text-xl">D</span>
                </Button>
            </div>
        </div>
    )
}
