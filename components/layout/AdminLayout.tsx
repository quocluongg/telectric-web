'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Layers,
    Users,
    Megaphone,
    LogOut,
    Settings,
    ShieldCheck, // Icon cho Bảo hành
    SearchCheck  // Icon cho Tra cứu
} from 'lucide-react'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {

    const pathname = usePathname()

    const menuItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/products', icon: <Package size={20} />, label: 'Sản phẩm' },
        { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Đơn hàng' },
        { path: '/admin/categories', icon: <Layers size={20} />, label: 'Danh mục' },
        // --- MỤC MỚI THÊM ---
        { path: '/admin/warranty', icon: <ShieldCheck size={20} />, label: 'Quản lý bảo hành' },
        { path: '/admin/warranty-check', icon: <SearchCheck size={20} />, label: 'Tra cứu bảo hành' },
        // -------------------
        { path: '/admin/users', icon: <Users size={20} />, label: 'Người dùng' },
        { path: '/admin/news', icon: <Megaphone size={20} />, label: 'Bài viết' },
    ]

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <Link href="/admin/dashboard" className="text-xl font-bold text-orange-600 tracking-tight flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white">T</div>
                        TLECTRIC
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
                    {menuItems.map((item) => {
                        const isActive = item.path === '/admin'
                            ? pathname === '/admin'
                            : pathname?.startsWith(item.path)

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-orange-600'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-500 transition-colors text-sm font-medium">
                        <LogOut size={20} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 ml-64 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-800 dark:text-white capitalize text-lg">
                            {/* Hiển thị tiêu đề trang dựa trên path */}
                            {[...menuItems].reverse().find(item =>
                                item.path === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.path)
                            )?.label || 'Quản trị'}
                        </h2>
                    </div>

                </header>

                {/* Page Content */}
                <main className="p-6 lg:p-10">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout