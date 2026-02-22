"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Calendar, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

export default function CampaignListPage() {
    const supabase = createClient();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("campaigns")
            .select("*, campaign_items(count)")
            .order("created_at", { ascending: false });
        if (!error && data) setCampaigns(data);
        setLoading(false);
    };

    const isCampaignActive = (campaign: any) => {
        if (!campaign.is_active) return false;
        const now = new Date();
        return now >= new Date(campaign.start_time) && now <= new Date(campaign.end_time);
    };

    const isCampaignUpcoming = (campaign: any) => {
        if (!campaign.is_active) return false;
        return new Date() < new Date(campaign.start_time);
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Zap className="h-8 w-8 text-electric-orange" />
                        Quản lý Siêu Sale
                    </h1>
                    <p className="text-slate-500 mt-1">Thiết lập các khung Giờ Vàng giảm giá hiển thị tự động trên Trang chủ.</p>
                </div>
                <Button asChild className="bg-electric-orange hover:bg-orange-600">
                    <Link href="/admin/campaigns/new">
                        <Plus className="h-4 w-4 mr-2" /> Tạo chiến dịch mới
                    </Link>
                </Button>
            </div>

            <div className="bg-white dark:bg-industrial-black border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Tìm tên chiến dịch..." className="pl-9" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">Chiến dịch</th>
                                <th className="px-6 py-4 font-medium">Trạng thái</th>
                                <th className="px-6 py-4 font-medium">Thời gian</th>
                                <th className="px-6 py-4 font-medium text-center">Phân loại Sale</th>
                                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                                            <p>Chưa có chiến dịch Siêu Sale nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign) => {
                                    const active = isCampaignActive(campaign);
                                    const upcoming = isCampaignUpcoming(campaign);
                                    const prodCount = campaign.campaign_items?.[0]?.count || 0;
                                    return (
                                        <tr key={campaign.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{campaign.name}</td>
                                            <td className="px-6 py-4">
                                                {!campaign.is_active ? (
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">Đã tắt</Badge>
                                                ) : active ? (
                                                    <Badge className="bg-green-500 hover:bg-green-600 animate-pulse">Đang diễn ra</Badge>
                                                ) : upcoming ? (
                                                    <Badge variant="outline" className="border-electric-orange text-electric-orange">Sắp diễn ra</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Đã kết thúc</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    <Calendar className="h-4 w-4" />
                                                    <div className="flex flex-col text-xs">
                                                        <span>{format(new Date(campaign.start_time), "HH:mm - dd/MM/yyyy", { locale: vi })}</span>
                                                        <span className="text-slate-400">đến {format(new Date(campaign.end_time), "HH:mm - dd/MM/yyyy", { locale: vi })}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center bg-orange-100 text-electric-orange font-bold text-xs rounded-full h-6 px-2.5">
                                                    {prodCount} loại
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button asChild variant="ghost" size="sm" className="hover:text-electric-orange">
                                                    <Link href={`/admin/campaigns/${campaign.id}`}>Quản lý</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
