import { Metadata } from "next"
import Image from "next/image"

import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "./components/sidebar-nav"
import { User, Bell, History, Shield, CreditCard, Ticket } from "lucide-react"

export const metadata: Metadata = {
    title: "Tài khoản",
    description: "Quản lý tài khoản của bạn",
}

const sidebarNavItems = [
    {
        title: "Thông tin chung",
        href: "/account/profile",
        icon: <User className="w-4 h-4" />,
    },
    {
        title: "Cài đặt thông báo",
        href: "/account/notifications",
        icon: <Bell className="w-4 h-4" />,
    },
]

const historyNavItems = [
    {
        title: "Lịch sử đơn hàng",
        href: "/account/orders",
        icon: <History className="w-4 h-4" />,
    },
]

interface SettingsLayoutProps {
    children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <div className="hidden space-y-6 p-10 pb-16 md:block bg-[#0f111a] min-h-screen text-white">
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-gray-500 uppercase">
                        Tài khoản
                    </h2>
                    <SidebarNav items={sidebarNavItems} />
                    <h2 className="mt-8 mb-2 px-4 text-xs font-semibold tracking-tight text-gray-500 uppercase">
                        Lịch sử
                    </h2>
                    <SidebarNav items={historyNavItems} />
                </aside>
                <div className="flex-1 lg:max-w-4xl">{children}</div>
            </div>
        </div>
    )
}
