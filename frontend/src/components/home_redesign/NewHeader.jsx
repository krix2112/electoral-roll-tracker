import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Bell, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from '../../assets/logo-new.png';

export function NewHeader() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close notifications when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationRef]);

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'Features', href: '#features' },
        { label: 'About', href: '#about' },
        { label: 'Dashboard', href: '/dashboard' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between">
                    {/* Logo - ALWAYS VISIBLE now */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 transition-opacity duration-300"
                    >
                        <img src={logo} alt="MatSetu" className="h-10" />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => {
                            const isHashLink = item.href.startsWith('#');
                            const isHome = location.pathname === '/';

                            // If it's a hash link and we're not on home, prepend /
                            const href = (isHashLink && !isHome) ? `/${item.href}` : item.href;

                            return (
                                <a
                                    key={item.label}
                                    href={href}
                                    className="text-gray-600 hover:text-[#2D3E8F] transition-colors text-sm font-medium relative group"
                                >
                                    {item.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B] transition-all duration-300 group-hover:w-full" />
                                </a>
                            );
                        })}
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4 relative" ref={notificationRef}>
                        {/* Notification Button */}
                        <button
                            className={`relative p-2 rounded-full transition-colors ${notificationsOpen ? 'bg-gray-100 text-[#FF6B4A]' : 'text-gray-600 hover:bg-gray-100'}`}
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Notifications Dropdown */}
                        {notificationsOpen && (
                            <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    <button className="text-xs text-[#FF6B4A] font-medium hover:text-[#FF8F6B]">Mark all read</button>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-2 bg-red-500 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Anomaly Detected</p>
                                                <p className="text-xs text-gray-500 mt-1">Suspicious voter addition pattern in Ward 12.</p>
                                                <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Audit Report Ready</p>
                                                <p className="text-xs text-gray-500 mt-1">Your monthly analysis report is ready for download.</p>
                                                <p className="text-xs text-gray-400 mt-2">5 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-2 bg-gray-300 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">System Update</p>
                                                <p className="text-xs text-gray-500 mt-1">New forensics engine features are now live.</p>
                                                <p className="text-xs text-gray-400 mt-2">1 day ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 border-t border-gray-50 text-center bg-gray-50/50">
                                    <Link to="/dashboard" className="text-xs font-medium text-gray-600 hover:text-[#FF6B4A]">View all notifications</Link>
                                </div>
                            </div>
                        )}

                        {/* Upload Data Button */}
                        <Link to="/compare">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                                <Upload className="w-4 h-4" />
                                Upload Data
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-700"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 bg-white rounded-xl p-4 shadow-xl">
                        <nav className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="text-gray-600 hover:text-[#2D3E8F] transition-colors block py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))}
                            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                <button className="flex items-center gap-2 text-gray-600 font-medium py-2">
                                    <Bell className="w-5 h-5" /> Notifications
                                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
                                </button>
                                <Link to="/compare">
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#FF6B4A] text-white rounded-lg text-sm font-medium">
                                        <Upload className="w-4 h-4" /> Upload Data
                                    </button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
