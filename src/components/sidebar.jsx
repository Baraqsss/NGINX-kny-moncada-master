import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Lucide icons for menu & close
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }) => {
    // Internal state if no external state is provided
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    
    // Use external state if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalSetIsOpen || setInternalIsOpen;
    
    const { user: authUser, isAuthenticated } = useAuth();

    // Debug log
    console.log('Sidebar - IsOpen:', isOpen);
    console.log('Sidebar - Auth User:', authUser);
    console.log('Sidebar - Is Authenticated:', isAuthenticated);

    // Helper function for role check
    const hasRole = (role) => {
        if (!authUser?.role) return false;
        return authUser.role.toLowerCase() === role.toLowerCase();
    };

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
                    <Link to="/events" className="px-6 py-2 flex items-center gap-2 hover:bg-[#5b4a94]" onClick={() => setIsOpen(false)}>📅 Events</Link>
                    <Link to="/announcements" className="px-6 py-2 flex items-center gap-2 hover:bg-[#5b4a94]" onClick={() => setIsOpen(false)}>📢 Announcements</Link>
                    
                    {isAuthenticated && (
                        <>
                            <hr className="border-violet-400 border-opacity-30 mx-4" />
                            
                            <Link to="/profile" className="px-6 py-2 flex items-center gap-2 hover:bg-[#5b4a94]" onClick={() => setIsOpen(false)}>👤 Profile</Link>
                            {hasRole('Admin') && (
                                <Link to="/admin/dashboard" className="px-6 py-2 flex items-center gap-2 hover:bg-[#5b4a94]" onClick={() => setIsOpen(false)}>
                                    🎛️ Admin Dashboard
                                </Link>
                            )}
                            {(hasRole('Member') || !hasRole('Admin')) && (
                                <Link to="/member/dashboard" className="px-6 py-2 flex items-center gap-2 hover:bg-[#5b4a94]" onClick={() => setIsOpen(false)}>
                                    📊 Member Dashboard
                                </Link>
                            )}
                        </>
                    )}
                </nav>

                {/* Login/Sign Up Button (Fixed at Bottom) */}
                {!isAuthenticated && (
                    <div className="absolute bottom-6 w-full px-6">
                        <Link to="/login" className="block text-center py-3 bg-white text-[#6955A4] font-semibold rounded-md" onClick={() => setIsOpen(false)}>
                            Login/Sign Up
                        </Link>
                    </div>
                )}
            </div>

            {/* Fixed Menu Button (Only Visible When Sidebar is Closed) */}
            {!isOpen && (
                <button 
                    className="fixed top-2 left-2 z-50 p-3 text-white bg-[#6955A4] shadow-lg rounded-lg hover:bg-violet-700"
                    onClick={() => setIsOpen(true)}
                >
                    <Menu size={24} />
                </button>
            )}
        </div>
    );
};

export default Sidebar;
