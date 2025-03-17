import React, {useState} from "react";
import AuthImg from "../assets/AuthImg.png";
import logo from "../assets/logo.png";
import {EyeIcon, EyeSlashIcon} from '@heroicons/react/24/outline';
import {Link, useNavigate} from "react-router-dom"; // Import premade icons
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { login, error: authError } = useAuth();
    // State to toggle the password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoginError('');
        setIsLoading(true);
        
        const formData = new FormData(event.target);
        const username = formData.get("username");
        const password = formData.get("password");

        try {
            // Call the login function from our auth context
            await login({ username, password });
            // Redirect to home page on successful login
            navigate('/');
        } catch (err) {
            setLoginError(err.message || 'Failed to login. Please check your credentials.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-100 text-gray-900 flex justify-center items-center overflow-hidden">
            <div
                className="flex rounded-l-lg lg:w-2/3 xl:w-8/12 max-w-screen-xl bg-white shadow sm:rounded-lg flex justify-center">
                <div className="lg:w-1/2 xl:w-8/12 p-6 sm:p-12">
                    <div className="mt-12 flex flex-col items-center">
                        <h1 className="text-2xl xl:text-3xl font-extrabold text-violet-700">
                            Login
                        </h1>
                        <div className="w-full mt-8">
                            <form onSubmit={handleSubmit} className="mx-auto max-w-xs">
                                {/* Display error message if login fails */}
                                {loginError && (
                                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                                        {loginError}
                                    </div>
                                )}
                                
                                {/* Username Input */}
                                <input
                                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    required
                                />
                                {/* Password Input with Toggle */}
                                <div className="relative mt-5">
                                    <input
                                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                                        type={showPassword ? "text" : "password"} // Toggle field type
                                        name="password"
                                        placeholder="Password"
                                        required
                                    />
                                    {/* Toggle Button */}
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-violet-700 focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)} // Toggle the state
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5"/> // Crossed-out eye (password hidden)
                                        ) : (
                                            <EyeIcon className="h-5 w-5"/> // Open eye (password visible)
                                        )}
                                    </button>

                                </div>

                                {/* Forgot Password - Right-Aligned */}
                                <div className="text-right mt-2">
                                    <a
                                        href="#"
                                        className="text-sm text-violet-700 hover:underline"
                                    >
                                        Forgot Password?
                                    </a>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`mt-5 tracking-wide font-semibold bg-violet-700 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <span>Loading...</span>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-6 h-6 -ml-2"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                                <circle cx="8.5" cy="7" r="4"/>
                                            </svg>
                                            <span className="ml-3">Login</span>
                                        </>
                                    )}
                                </button>
                            </form>
                            {/* Signup Link */}
                            <p className="mt-6 text-sm text-center text-violet-700">
                                <Link to="/signup" className="hover:underline font-semibold">
                                    Signup to Become a Member
                                </Link>

                            </p>

                            {/* Terms and Privacy */}
                            <p className="mt-6 text-xs text-gray-600 text-center">
                                By logging in, you agree to our
                                <a
                                    href="#"
                                    className="border-b border-gray-500 border-dotted mx-1"
                                >
                                    Terms of Service
                                </a>
                                and
                                <a
                                    href="#"
                                    className="border-b border-gray-500 border-dotted ml-1"
                                >
                                    Privacy Policy
                                </a>.
                            </p>
                        </div>
                    </div>
                </div>
                {/* Right side with gradient background */}
                <div
                    className="lg:w-1/2 xl:w-8/12 p-6 sm:p-12 bg-gradient-to-br from-purple-600 via-blue-400 via-green-300 to-yellow-300 rounded-r-lg">
                    <div
                        className="w-full bg-contain bg-center bg-no-repeat h-full "
                        style={{
                            backgroundImage: `url(${logo})`,
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default Login;