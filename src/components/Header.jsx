"use client";
import React, { useState, useEffect, useRef } from "react";

const Header = ({ title, description }) => {
    const [currentTime, setCurrentTime] = useState("");
    const [userName, setUserName] = useState("Ajmal");
    const [userRole, setUserRole] = useState("Admin");
    const [notificationCount, setNotificationCount] = useState(3);

    // State to manage expanded sections
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

    const notificationRef = useRef(null);
    const userProfileRef = useRef(null);

    useEffect(() => {
        // Function to update the date and time every second
        const interval = setInterval(() => {
            const now = new Date();
            const formattedDate = now.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });

            // Adding "-" after the date
            const [date, time] = formattedDate.split(", ");
            const formattedDateWithDash = `${date} - ${time}`;

            setCurrentTime(formattedDateWithDash);
        }, 1000);

        // Clear the interval when the component is unmounted
        return () => clearInterval(interval);
    }, []);

    // Handle clicks outside the dropdowns to close them
    useEffect(() => {
        function handleClickOutside(event) {
            // Close notifications if clicked outside
            if (notificationRef.current && !notificationRef.current.contains(event.target) && 
                !event.target.closest('[data-notification-trigger]')) {
                setIsNotificationsOpen(false);
            }
            
            // Close user profile if clicked outside
            if (userProfileRef.current && !userProfileRef.current.contains(event.target) && 
                !event.target.closest('[data-profile-trigger]')) {
                setIsUserProfileOpen(false);
            }
        }

        // Add click listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationRef, userProfileRef]);

    // Toggle functions instead of mouse enter/leave
    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
        if (!isNotificationsOpen) setIsUserProfileOpen(false); // Close other dropdown
    };

    const toggleUserProfile = () => {
        setIsUserProfileOpen(!isUserProfileOpen);
        if (!isUserProfileOpen) setIsNotificationsOpen(false); // Close other dropdown
    };

    return (
        <div className="flex flex-col w-full">
            <header className="flex justify-between items-start px-16 py-7 max-md:px-10 max-sm:px-5">
                {/* Dashboard Title */}
                <div className="flex flex-col">
                    <h1 className="mb-1 text-3xl font-bold text-black">{title}</h1>
                    <p className="text-sm text-neutral-500 text-[16px]">{description}</p>
                </div>

                {/* Header Actions */}
                <div className="flex gap-5 items-center">
                    {/* Date and Time with - symbol */}
                    <div
                        className="flex items-center gap-2 bg-white rounded-md border border-sky-400 text-center p-4 py-1"
                        role="status"
                        aria-label="Current Date and Time"
                    >
                        <span className="text-sm font-semibold text-[#156AEF]">{currentTime}</span>
                    </div>

                    {/* Notification Bell */}
                    {/*  */}

                    {/* User Profile */}
                    {/* <div className="gradient-border">
                        <div className="gradient-border-inner">
                            <img src="" alt="" />
                        </div>
                    </div> */}
                    <div className="relative">
                        <button
                            data-profile-trigger
                            onClick={toggleUserProfile}
                            className="flex gap-4 items-center"
                            aria-label="User profile"
                        >
                            <div className="flex flex-col">
                                {/* <span className="text-sm font-semibold text-black">{userName}</span> */}
                                <span className="text-xs text-black">{userRole}</span>
                            </div>
                            <div
                                className="flex relative justify-center items-center w-5 h-5"
                                role="button"
                                tabIndex={0}
                                aria-label="Input design control"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute left-0 top-0 w-full h-full"
                                    role="img"
                                    aria-label="Triangle indicator"
                                >
                                    <rect
                                        x="0.5"
                                        y="0.5"
                                        width="13"
                                        height="13"
                                        rx="1.5"
                                        fill="white"
                                        stroke="#F7F7F7"
                                    />
                                    <path 
                                        d={isUserProfileOpen ? "M7 5L10.4641 11H3.5359L7 5Z" : "M7 11L3.5359 5L10.4641 5L7 11Z"} 
                                        fill="#D9D9D9" 
                                    />
                                </svg>
                            </div>
                        </button>

                        {/* User Profile Dropdown */}
                        {/* {isUserProfileOpen && (
                            <div
                                ref={userProfileRef}
                                className="absolute top-10 right-0 mt-2 w-48 bg-white shadow-xl rounded-lg border border-gray-100 p-3 transition-all duration-300 ease-in-out transform opacity-100 z-50"
                            >
                                <div className="flex flex-col space-y-3">

                                    
                                    <button className="flex items-center space-x-3 text-red-500 hover:text-red-600 transition-colors duration-200 group mt-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="text-sm font-medium">Logout</span>
                                    </button>
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;