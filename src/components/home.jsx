import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo2.png";
import group from "../assets/group.jpg";


const Home = () => {
    return (
        <div className="flex flex-col w-full h-full items-center justify-start bg-gray-100">
            {/* AuthImg above the logo */}
            <div className="w-full flex justify-center">
                <img
                    alt="Auth background image"
                    className="w-screen object-cover" 
                    style={{ height: "700px" }} 
                    src={group}
                />
            </div>

            {/* Logo */}
            <img
                alt="Kaya Natin Moncada Youth logo with colorful arrows"
                className="w-90 mb-4 mt-20" 
                src={logo}
            />

            {/* Description Text */}
            <p className="text-[#6955A4] text-xl font-bold leading-relaxed text-left px-4 mb-6">
                A non-profit and non-government organization that promotes good <br/>
                governance and ethical leadership in the Philippines.
            </p>

            {/* Buttons */}
            <div className="flex space-x-4 pb-10 mb-20">
                <Link to="/donate">
                    <button
                        className="text-white py-2 px-6 rounded-lg border-2 border-black"
                        style={{ backgroundColor: "#A4D280" }}
                    >
                        Donate Now
                    </button>
                </Link>
                <Link to="/volunteer">
                    <button
                        className="text-white py-2 px-6 rounded-lg border-2 border-black"
                        style={{ backgroundColor: "#79C7CB" }}
                    >
                        Volunteer Now
                    </button>
                </Link>
            </div>

            {/* Projects and Events Section */}
            <div className="flex flex-col w-full h-full mt-20 text-center">
                <h2 className="text-2xl font-bold text-[#6955A4] mb-6">Projects and Events</h2>
                <div className="flex flex-wrap justify-center gap-6">
                    {/* Project Cards */}
                    <div className="w-60 h-56 bg-[#6bcbd9] flex items-center justify-center text-white font-bold text-xl">Title</div>
                    <div className="w-60 h-56 bg-[#79c7cb] flex items-center justify-center text-white font-bold text-xl">Title</div>
                    <div className="w-60 h-56 bg-[#a4d280] flex items-center justify-center text-white font-bold text-xl">Title</div>
                </div>

                {/* Donations Section */}
                <div className="flex flex-col items-center mt-12 mb-24">
                    <div className="flex items-center gap-6">
                        <div className="w-40 h-40 bg-[#d097c4]"></div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-black">FOR DONATIONS</h3>
                            <p className="text-sm text-gray-700">Scan the QR Code or visit this link for more information.</p>
                            <p className="italic font-semibold text-[#9985be] mt-2">Thank you!</p>
                            <p className="text-sm text-gray-700">Any amount of money will be greatly appreciated.</p>
                        </div>
                    </div>
                </div>
            </div>

           
        </div>
    );
};

export default Home;
