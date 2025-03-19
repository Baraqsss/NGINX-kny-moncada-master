import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo2.png";
import user from "../assets/user.png";
import Sidebar from "../components/sidebar";
import { useAuth } from "../context/AuthContext";

const Header = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user: authUser, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    
    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Debug log
    console.log('Auth User:', authUser);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('User Role:', authUser?.role);
    
    // Helper function for role check
    const hasRole = (role) => {
        if (!authUser?.role) return false;
        return authUser.role.toLowerCase() === role.toLowerCase();
    };

    useEffect(() => {
        // Show user data on initialization
        console.log('Current user data:', authUser);
        console.log('Is member?', hasRole('member'));
        console.log('Is approved?', authUser?.isApproved);
    }, [authUser]);

    return (
        <div className="navbar shadow-sm bg-opacity-90 backdrop-blur-sm backdrop-filter backdrop-saturate-150" style={{ backgroundColor: "#6955A4" }}> {/* Custom color for the header */}
            {/* Sidebar Component */}
            <div className="fixed top-4 left-4 z-50">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </div>

            {/* Left: Logo */}
            <div className="navbar-start ml-20">
                <Link to="/" >
                    {/* Logo image with increased size */}
                    <img src={logo} alt="Logo" className="h-12 p-0 hover:shadow-lg" /> {/* Increased size */}
                </Link>
            </div>
{/*
            <!-- Center: Navigation for larger screens -->
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal text-white text-lg">
                    <li>
                        <Link to="/" className="hover:text-white font-semibold">Home</Link>
                    </li>
                    <li>
                        <Link to="/about" className="hover:text-white font-semibold">About Us</Link>
                    </li>
                    <li>
                        <Link to="/donate" className="hover:text-white font-semibold">Donate</Link>
                    </li>
                    <li>
                        <Link to="/volunteer" className="hover:text-white font-semibold">Volunteer</Link>
                    </li>
                </ul>
            </div>
*/}

            {/* Right: Profile dropdown or Login/Signup buttons */}
            <div className="navbar-end mr-4">
                {isAuthenticated ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} className="btn btn-ghost btn-circle avatar hover:bg-opacity-90">
                            <img 
                                className="w-10 h-10 rounded-full" 
                                src={user}
                                alt={`${authUser?.name || 'User'}'s profile`} 
                            />
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-gray-100 rounded-box z-50 mt-3 w-52 p-2 shadow">
                            <li className="text-gray-700">
                                <div>
                                    <strong>{authUser?.name || 'User'}</strong>
                                    <br />
                                    <small>{authUser?.role || 'Member'}</small>
                                </div>
                            </li>
                            <li>
                                <hr className="border-gray-300" />
                            </li>
                            <li>
                                <Link to="/profile" className="text-violet-700 hover:font-bold hover:shadow-lg hover:bg-gray-300">Profile</Link>
                            </li>
                            {hasRole('Admin') && (
                                <li>
                                    <Link to="/admin/dashboard" className="text-violet-700 hover:font-bold hover:shadow-lg hover:bg-gray-300">Admin Dashboard</Link>
                                </li>
                            )}
                            {(hasRole('Member') || !hasRole('Admin')) && (
                                <li>
                                    <Link to="/member/dashboard" className="text-violet-700 hover:font-bold hover:shadow-lg hover:bg-gray-300">Member Dashboard</Link>
                                </li>
                            )}
                            <li>
                                <button 
                                    className="text-red-500 hover:shadow-lg hover:font-bold hover:bg-gray-300" 
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link to="/login" className="btn btn-sm bg-white text-violet-700 hover:bg-gray-200">
                            Login
                        </Link>
                        <Link to="/signup" className="btn btn-sm bg-violet-800 text-white hover:bg-violet-900">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
