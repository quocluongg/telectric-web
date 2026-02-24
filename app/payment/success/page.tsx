"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, ChevronRight, ArrowLeft, Receipt } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams?.get('orderId');

    return (
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Header section */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 px-8 py-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30 shadow-xl">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-sm">Đặt Hàng Thành Công!</h1>
                    <p className="text-green-50 text-sm font-medium">
                        Cảm ơn bạn đã tin tưởng và mua sắm tại TELECTRIC
                    </p>
                </div>
            </div>

            {/* Content section */}
            <div className="p-8">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 mb-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Receipt className="h-5 w-5 text-slate-400" />
                        <h3 className="font-semibold text-slate-800">Thông tin đơn hàng</h3>
                    </div>

                    <div className="space-y-3">
                        {orderId && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-200/60 last:border-0">
                                <span className="text-slate-500 text-sm font-medium">Mã đơn hàng</span>
                                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                                    #{orderId.slice(0, 8).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b border-slate-200/60 last:border-0">
                            <span className="text-slate-500 text-sm font-medium">Trạng thái</span>
                            <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Đã thanh toán
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-500 text-sm mb-8 leading-relaxed px-4">
                    Chúng tôi sẽ sớm liên hệ với bạn để xác nhận đơn hàng và tiến hành giao hàng trong thời gian sớm nhất.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 group"
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                        Về trang chủ
                    </Link>
                    <Link
                        href="/products"
                        className="flex-1 flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition-all active:scale-95 group"
                    >
                        Tiếp tục mua sắm
                        <ChevronRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-500 font-medium">Đang tải dữ liệu...</span>
                </div>
            }>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
