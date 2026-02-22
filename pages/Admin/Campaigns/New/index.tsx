"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCampaignPage() {
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("00:00");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("23:59");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !startDate || !endDate) {
            toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin.", variant: "destructive" });
            return;
        }

        const startTimestamp = new Date(`${startDate}T${startTime}:00`).toISOString();
        const endTimestamp = new Date(`${endDate}T${endTime}:00`).toISOString();

        if (new Date(startTimestamp) >= new Date(endTimestamp)) {
            toast({ title: "Lỗi thời gian", description: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu.", variant: "destructive" });
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from("campaigns")
            .insert({ name, start_time: startTimestamp, end_time: endTimestamp, is_active: true })
            .select()
            .single();
        setLoading(false);

        if (error) {
            toast({ title: "Tạo thất bại", description: error.message, variant: "destructive" });
            return;
        }

        toast({ title: "Thành công", description: "Đã tạo chiến dịch! Vui lòng thêm sản phẩm." });
        router.push(`/admin/campaigns/${data.id}`);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="rounded-full">
                    <Link href="/admin/campaigns"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tạo Chiến Dịch Siêu Sale</h1>
                    <p className="text-slate-500 text-sm">Thiết lập thông tin và thời gian chạy cho chiến dịch.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-industrial-black rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col items-center">
                <div className="space-y-2 w-full max-w-lg">
                    <Label htmlFor="name" className="text-base font-semibold">Tên Chiến Dịch</Label>
                    <Input
                        id="name"
                        placeholder="VD: Siêu Sale Black Friday 2026..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="py-6 text-lg"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
                    <div className="space-y-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/20">
                        <h3 className="font-semibold text-slate-800 dark:text-white">Thời gian BẮT ĐẦU</h3>
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Ngày</Label>
                            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Giờ</Label>
                            <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-red-50 dark:bg-red-900/10">
                        <h3 className="font-semibold text-red-600 dark:text-red-400">Thời gian KẾT THÚC</h3>
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-red-600 dark:text-red-400">Ngày</Label>
                            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="border-red-200 focus-visible:ring-red-500" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime" className="text-red-600 dark:text-red-400">Giờ</Label>
                            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="border-red-200 focus-visible:ring-red-500" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end w-full max-w-lg">
                    <Button type="submit" disabled={loading} className="bg-electric-orange hover:bg-orange-600 text-white w-full sm:w-auto px-8">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...</> : <><Save className="mr-2 h-4 w-4" /> Lưu và Thêm Sản Phẩm</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}
