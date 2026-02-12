import Link from "next/link";
import { Mail, Phone, HelpCircle, User } from "lucide-react";

export const TopBar = () => {
    return (
        <div className="w-full bg-industrial-black text-slate-gray py-2 text-xs border-b border-white/10">
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Left Side: Contact Info */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                        <Phone size={14} className="text-electric-orange" />
                        <span>Hotline: <strong className="text-white">1900 8888</strong></span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer hidden sm:flex">
                        <Mail size={14} className="text-electric-orange" />
                        <span>Email: contact@telectric.com</span>
                    </div>
                </div>

                {/* Right Side: Utils */}
                <div className="flex items-center gap-6">
                    <Link href="/support" className="flex items-center gap-2 hover:text-white transition-colors">
                        <HelpCircle size={14} />
                        <span>Hỗ trợ khách hàng</span>
                    </Link>
                    <Link href="/auth/login" className="flex items-center gap-2 hover:text-white transition-colors">
                        <User size={14} />
                        <span>Tài khoản</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};
