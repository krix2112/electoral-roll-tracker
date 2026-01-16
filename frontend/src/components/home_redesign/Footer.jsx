import logo from '../../assets/logo-new.png';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <img src={logo} alt="MatSetu" className="h-8" />

                    <p className="text-gray-600 text-sm">
                        Ensuring electoral integrity through transparency and technology
                    </p>

                    <p className="text-gray-500 text-sm">
                        © 2026 MatSetu. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
