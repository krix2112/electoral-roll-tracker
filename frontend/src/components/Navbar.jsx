import { Link } from 'react-router-dom'
import { Button } from './ui/Button'
import { User, Bell } from 'lucide-react'

export function Navbar() {
    return (
        <nav className="border-b border-gray-100 bg-white">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <div className="bg-indigo-700 text-white font-bold p-1.5 rounded text-xl">RD</div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-none">RollDiff</span>
                        <span className="text-[10px] text-gray-500 font-medium tracking-wide">Electoral Roll Forensic Audit</span>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="hidden md:flex">
                        How it Works
                    </Button>
                    <Button variant="outline" size="sm">
                        Admin Login
                    </Button>
                </div>
            </div>
        </nav>
    )
}
