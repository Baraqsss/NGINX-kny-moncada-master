import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Lucide icons for menu & close

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-screen w-64 bg-[#6955A4] text-white shadow-lg transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 bg-[#5b4a94]">
                    <div>
                        <h2 className="text-lg font-bold">Kaya Natin Youth</h2>
                        <p className="text-sm">Moncada, Tarlac</p>
                    </div>
                    
                    {/* Close Button */}
                    <button onClick={() => setIsOpen(false)} className="text-white p-2">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-4 mt-6">
                    <Link to="/" className="px-6 py-2 flex items-center gap-2 hover:bg-[#5b4a94]" onClick={() => setIsOpen(false)}>🏠 Home</Link>
                    <Link to="/about" className="px-6 py-2 flex items-center gap-2 hover:bg-[#5b4a94]" onClick={() => setIsOpen(false)}>ℹ️ About Us</Link>
                    <Link to="/donate" className="px-6 py-2 flex items-center gap-2 hover:bg-[#5b4a94]" onClick={() => setIsOpen(false)}>💰 Donate</Link>
                    <Link to="/volunteer" className="px-6 py-2 flex items-center gap-2 hover:bg-[#5b4a94]" onClick={() => setIsOpen(false)}>🤝 Volunteer</Link>
                    <Link to="/profile" className="px-6 py-2 flex items-center gap-2 hover:bg-[#5b4a94]" onClick={() => setIsOpen(false)}>👤 Profile</Link>
                </nav>

                {/* Login/Sign Up Button (Fixed at Bottom) */}
                <div className="absolute bottom-6 w-full px-6">
                    <Link to="/login" className="block text-center py-3 bg-white text-[#6955A4] font-semibold rounded-md" onClick={() => setIsOpen(false)}>
                        Login/Sign Up
                    </Link>
                </div>
            </div>

            {/* Fixed Menu Button (Only Visible When Sidebar is Closed) */}
            {!isOpen && (
                <button 
                    className="fixed top-2 bottom-6 left-6 z-50 p-3 text-white bg-[#6955A4]  shadow-lg"
                    onClick={() => setIsOpen(true)}
                >
                    <Menu size={24} />
                </button>
            )}
        </div>
    );
};

export default Sidebar;
