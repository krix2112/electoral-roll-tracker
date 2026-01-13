import { Link } from 'react-router-dom'
import { Button } from './ui/Button'
import { User, Bell, Upload } from 'lucide-react'

export function Navbar() {
    return (
        <nav className="border-b border-gray-100 bg-white">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <div className="bg-indigo-700 text-white font-bold p-1.5 rounded text-xl">RD</div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-none">
                            <span className="text-orange-600">मत</span><span className="text-green-600">सेतु</span>
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium tracking-wide">Electoral Roll Forensic Audit</span>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <Link to="/notifications" className="relative p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </Link>
                    <Link to="/upload">
                        <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Data
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                        Admin Login
                    </Button>
                </div>
            </div>
        </nav>
    )
}
