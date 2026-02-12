
import Link from 'next/link';

const Header = () => {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 dark:bg-industrial-black/95 dark:border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                <Link href="/" className="text-2xl font-heading font-bold text-electric-orange tracking-tight">
                    TLECTRIC
                </Link>
                <nav className="hidden md:block">
                    <ul className="flex space-x-8">
                        <li><Link href="#" className="text-sm font-medium text-slate-gray hover:text-electric-orange transition-colors">Products</Link></li>
                        <li><Link href="#" className="text-sm font-medium text-slate-gray hover:text-electric-orange transition-colors">Solutions</Link></li>
                        <li><Link href="#" className="text-sm font-medium text-slate-gray hover:text-electric-orange transition-colors">Support</Link></li>
                        <li><Link href="#" className="text-sm font-medium text-slate-gray hover:text-electric-orange transition-colors">Company</Link></li>
                    </ul>
                </nav>
                <div className="flex items-center space-x-4">
                    {/* Placeholder for actions */}
                    <button className="text-sm font-medium text-slate-gray hover:text-electric-orange transition-colors">Log in</button>
                    <button className="bg-electric-orange text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors">Get Started</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
