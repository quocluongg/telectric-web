import Link from 'next/link';
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-industrial-black text-slate-900 dark:text-white pt-16 pb-8 mt-auto border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Cột 1: Giới thiệu */}
                    <div>
                        <h4 className="font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-wider">Giới thiệu</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-gray">
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Trang chủ</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Giới thiệu</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Sản phẩm</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Liên hệ</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Kiến thức đồng hồ đo</a></li>
                        </ul>


                    </div>

                    {/* Cột 2: Chính sách */}
                    <div>
                        <h4 className="font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-wider">Chính sách công ty</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-gray">
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Hướng dẫn mua hàng</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Chính sách bảo hành & đổi trả</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Chính sách vận chuyển & thanh toán</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Chính sách bảo mật thông tin</a></li>
                        </ul>
                    </div>

                    {/* Cột 3: Hotline & Social */}
                    <div>
                        <h4 className="font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-wider">Hotline:</h4>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-electric-orange">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-electric-orange">093.400.14.35</p>
                                <p className="text-xs text-slate-500">(7:30 - 20:00)</p>
                            </div>
                        </div>

                        <h4 className="font-bold mb-4 text-slate-900 dark:text-white uppercase tracking-wider text-sm">Kết nối với chúng tôi:</h4>
                        <div className="flex gap-3">
                            {/* Thay bằng các icon thực tế của bạn */}
                            <Link href="https://www.facebook.com/telectric1992/" target="_blank">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/500px-Facebook_Logo_%282019%29.png" alt="Facebook" className="h-6" />
                            </Link>
                            <Link href="https://shopee.vn/telectric" target="_blank">
                                <img src="https://play-lh.googleusercontent.com/vrrgAukb27gHzlI-lwHQoabie4ByvZKMN9QVN7jgd5KCFgEKCbQClsujkfqhExpfrUdS=w600-h300-pc0xffffff-pd" alt="Youtube" className="h-6" />
                            </Link>
                        </div>
                    </div>

                    {/* Cột 4: Thông tin trụ sở (đã gom lại) */}
                    <div>
                        <h4 className="font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-wider">Thông tin liên hệ</h4>
                        <div className="text-sm text-slate-600 dark:text-slate-gray space-y-3">
                            <p><strong>Trụ sở chính:</strong> 72 Đông Hưng Thuận 03 - Tân Hưng Thuận - Quận 12 - TP.HCM</p>
                            <p><strong>Email:</strong> telectric1992@gmail.com</p>
                            <p className="pt-2 italic text-xs">Mã số thuế: 0316617014, cấp ngày 02/12/2020</p>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-bold mb-3 text-slate-900 dark:text-white uppercase tracking-wider text-sm">Giấy chứng nhận:</h4>

                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
                    <p className="text-slate-500 dark:text-slate-gray text-xs">
                        &copy; 2026 <strong>T - Electric
                        </strong>. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;