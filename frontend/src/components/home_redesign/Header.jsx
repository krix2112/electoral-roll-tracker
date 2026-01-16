import { LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo-new.png';
import PillNav from '../ui/PillNav';

export function Header() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Connections', href: '#connections' }
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm relative">
      {/* Subtle mirror effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-4 relative">
        <div className="flex items-center justify-between">
          {/* Logo and Site Name */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="MatSetu" className="h-10" />
          </Link>

          {/* Centered Navigation with PillNav style */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.slice(1).map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-700 hover:text-[#2D3E8F] transition-colors font-medium relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B4A] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Login Button */}
          <Link to="/login">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B] text-white rounded-full hover:shadow-lg transition-all font-medium">
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
