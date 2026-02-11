import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Format date
    const joinDate = new Date(user.created_at).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    return (
        <div className="space-y-6">
            <Card className="bg-[#1e2330] border-0 text-white">
                <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase text-gray-400">
                        Thông tin tài khoản
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Tên hiển thị</p>
                        <p className="text-lg font-bold">{user.user_metadata.full_name || "Chưa cập nhật"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Email</p>
                        <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">Ngày tham gia</p>
                        <p className="text-sm font-medium">{joinDate}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#1e2330] border-0 text-white">
                <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase text-gray-400">
                        Bảo mật tài khoản
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Đổi mật khẩu</p>
                            <p className="text-xs text-gray-500">Thay đổi mật khẩu đăng nhập của bạn</p>
                        </div>
                        <Button variant="outline" className="bg-[#2a3040] border-0 hover:bg-[#353b4d] text-white">
                            Đổi mật khẩu
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#1e2330] border-0 text-white">
                <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase text-gray-400">
                        Tài khoản liên kết
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#2a3040] flex items-center justify-center text-xl">G</div>
                            <div>
                                <p className="text-sm font-medium">Google</p>
                                <p className="text-xs text-gray-500">Chưa liên kết</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="text-white hover:text-[#00b4d8] hover:bg-transparent">
                            Liên kết
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
