import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <Card className="bg-[#1e2330] border-0 text-white">
                <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase text-gray-400">
                        Cài đặt thông báo
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-white">Thông báo qua Email</p>
                            <p className="text-xs text-gray-400">Nhận thông tin về đơn hàng và khuyến mãi</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-white">Thông báo đẩy (Push)</p>
                            <p className="text-xs text-gray-400">Nhận thông báo trên trình duyệt</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-white">Tin nhắn từ hệ thống</p>
                            <p className="text-xs text-gray-400">Các thông báo quan trọng về tài khoản</p>
                        </div>
                        <Switch defaultChecked disabled />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
