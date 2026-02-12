
const Footer = () => {
    return (
        <footer className="bg-white dark:bg-industrial-black text-slate-900 dark:text-white pt-16 pb-8 mt-auto border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-4">TLECTRIC</h3>
                        <p className="text-slate-600 dark:text-slate-gray text-sm leading-relaxed">
                            High-precision measuring instruments for industrial electrical systems.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-slate-900 dark:text-white">Products</h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-gray">
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Multimeters</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Clamp Meters</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Insulation Testers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-slate-900 dark:text-white">Support</h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-gray">
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Warranty</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-slate-900 dark:text-white">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-gray">
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-electric-orange transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
                    <p className="text-slate-600 dark:text-slate-gray text-sm">&copy; 2026 TLECTRIC. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
