import { Link } from 'react-router-dom'
import { Button } from './ui/Button'
import { ArrowRight } from 'lucide-react'

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md transition-all duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative flex items-baseline">
                        <span className="text-3xl font-bold text-white tracking-wide group-hover:text-[#D97706] transition-colors duration-300">मत</span>
                        <span className="text-3xl font-light text-white group-hover:text-[#D97706] transition-colors duration-300">Setu</span>
                    </div>
                </Link>

                {/* Centered Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {['About Us', 'Features', 'Connections'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(' ', '-')}`}
                            className="text-sm font-medium text-gray-300 hover:text-white hover:tracking-wide transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#D97706] after:transition-all after:duration-300 hover:after:w-full"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Link to="/login">
                        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                            Log In
                        </Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button className="bg-[#D97706] hover:bg-[#b45309] text-white border-none shadow-lg shadow-orange-900/20">
                            Launch App <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
