import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
    return (
        <div className="space-y-6">
            <Card className="bg-white dark:bg-[#1e2330] border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase text-slate-500 dark:text-gray-400">
                        Thông tin tài khoản
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-500">Tên hiển thị</p>
                        <Skeleton className="h-7 w-40" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-500">Email</p>
                        <Skeleton className="h-5 w-60" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-500">Ngày tham gia</p>
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-500">Nhóm tài khoản</p>
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#1e2330] border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase text-slate-500 dark:text-gray-400">
                        Bảo mật tài khoản
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Đổi mật khẩu</p>
                            <p className="text-xs text-slate-500 dark:text-gray-500">Thay đổi mật khẩu đăng nhập của bạn</p>
                        </div>
                        <Skeleton className="h-10 w-28" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
