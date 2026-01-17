import { Link } from 'react-router-dom';
import logo from '../../assets/logo-new.png';

export function NewFooter() {
    return (
        <footer className="relative py-16 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                {/* CTA Section */}
                <div className="relative mb-16 p-12 rounded-3xl overflow-hidden bg-gradient-to-br from-[#2D3E8F] to-[#4A5FB5]">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Protect Democracy?
                        </h2>
                        <p className="text-white/70 mb-8 max-w-xl mx-auto">
                            Start analyzing electoral rolls today. Our platform is ready to help you ensure transparency and integrity.
                        </p>
                        <Link to="/dashboard">
                            <button className="px-8 py-4 bg-white text-[#2D3E8F] rounded-full font-semibold hover:shadow-xl transition-all">
                                Get Started Free
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img src={logo} alt="MatSetu" className="h-8" />
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Ensuring electoral integrity through advanced AI-powered forensic analysis.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-gray-900 font-semibold mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><Link to="/dashboard" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Dashboard</Link></li>
                            <li><Link to="/compare" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Compare Rolls</Link></li>
                            <li><a href="#features" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Features</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-gray-900 font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Documentation</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">API Reference</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Tutorials</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">© 2026 MatSetu. All rights reserved.</p>
                    <p className="text-gray-400 text-sm">Powered by Teen Titans</p>
                </div>
            </div>
        </footer>
    );
}
