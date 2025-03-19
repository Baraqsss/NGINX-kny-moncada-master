import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo2.png";
import group from "../assets/group.jpg";

// API base URL
const API_BASE_URL = "http://localhost:5000/api";

const Home = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch announcements
                try {
                    const announcementsRes = await axios.get(`${API_BASE_URL}/announcements`);
                    console.log('Home - Announcements response:', announcementsRes.data);
                    
                    if (announcementsRes.data?.data?.announcements) {
                        setAnnouncements(announcementsRes.data.data.announcements);
                    } else if (Array.isArray(announcementsRes.data)) {
                        setAnnouncements(announcementsRes.data);
                    } else if (announcementsRes.data?.announcements) {
                        setAnnouncements(announcementsRes.data.announcements);
                    }
                } catch (err) {
                    console.error('Error fetching announcements:', err);
                }

                // Fetch events
                try {
                    const eventsRes = await axios.get(`${API_BASE_URL}/events`);
                    console.log('Home - Events response:', eventsRes.data);
                    
                    if (eventsRes.data?.data?.events) {
                        setEvents(eventsRes.data.data.events);
                    } else if (Array.isArray(eventsRes.data)) {
                        setEvents(eventsRes.data);
                    } else if (eventsRes.data?.events) {
                        setEvents(eventsRes.data.events);
                    }
                } catch (err) {
                    console.error('Error fetching events:', err);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Could not load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Limit to 3 most recent items
    const recentAnnouncements = announcements.slice(0, 3);
    const recentEvents = events.slice(0, 3);

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

            {/* Announcements Section */}
            <div className="flex flex-col w-full h-full mb-12 text-center">
                <h2 className="text-2xl font-bold text-[#6955A4] mb-6">Latest Announcements</h2>
                {loading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-700"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : recentAnnouncements.length === 0 ? (
                    <p className="text-gray-500">No announcements available at this time.</p>
                ) : (
                    <div className="flex flex-wrap justify-center gap-6 px-4">
                        {recentAnnouncements.map((announcement, index) => (
                            <div key={announcement._id || index} className="w-80 bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="h-12 bg-[#6955A4] flex items-center justify-center">
                                    <h3 className="text-white font-bold text-lg truncate px-2">{announcement.title}</h3>
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-700 h-24 overflow-hidden">{announcement.content}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {announcement.createdAt 
                                            ? new Date(announcement.createdAt).toLocaleDateString() 
                                            : 'Recently posted'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-4">
                    <Link 
                        to="/announcements" 
                        className="text-[#6955A4] hover:text-violet-800 font-medium underline"
                    >
                        View all announcements
                    </Link>
                </div>
            </div>

            {/* Projects and Events Section */}
            <div className="flex flex-col w-full h-full mt-12 text-center">
                <h2 className="text-2xl font-bold text-[#6955A4] mb-6">Projects and Events</h2>
                {loading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-700"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : recentEvents.length === 0 ? (
                    <div className="flex flex-wrap justify-center gap-6">
                        {/* Fallback Project Cards */}
                        <div className="w-60 h-56 bg-[#6bcbd9] flex items-center justify-center text-white font-bold text-xl">No Events Yet</div>
                        <div className="w-60 h-56 bg-[#79c7cb] flex items-center justify-center text-white font-bold text-xl">Coming Soon</div>
                        <div className="w-60 h-56 bg-[#a4d280] flex items-center justify-center text-white font-bold text-xl">Stay Tuned</div>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-6">
                        {recentEvents.map((event, index) => {
                            // Alternate colors for event cards
                            const colors = ['#6bcbd9', '#79c7cb', '#a4d280'];
                            const color = colors[index % colors.length];
                            
                            return (
                                <div 
                                    key={event._id || index} 
                                    className="w-60 h-56 flex flex-col items-center justify-center text-white rounded-lg shadow-lg overflow-hidden"
                                    style={{ backgroundColor: color }}
                                >
                                    <h3 className="font-bold text-xl mb-2 px-2 truncate w-full text-center">{event.title}</h3>
                                    <p className="text-sm px-4 text-center line-clamp-3">{event.description}</p>
                                    <p className="text-xs mt-2">
                                        {event.date 
                                            ? new Date(event.date).toLocaleDateString() 
                                            : 'Date TBA'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="mt-4 mb-8">
                    <Link 
                        to="/events" 
                        className="text-[#6955A4] hover:text-violet-800 font-medium underline"
                    >
                        View all events
                    </Link>
                </div>

                {/* Donations Section */}
                <div className="flex flex-col items-center mt-12 mb-24">
                    <div className="flex flex-col md:flex-row items-center gap-6">
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
