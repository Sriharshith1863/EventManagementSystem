import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginChoice() {
    const navigate = useNavigate();

    return (
        <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black justify-center items-center relative overflow-hidden pt-20 px-4">
            {/* Background animated blobs */}
            <div className="absolute top-10 left-10 w-48 h-48 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-16 right-16 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl animate-spin-slow"></div>

            {/* Header */}
            <div className="z-10 text-center absolute top-10">
                <h1 className="text-5xl font-extrabold text-white mb-2 drop-shadow-lg tracking-wide">
                    Event Sphere
                </h1>
            </div>

            {/* Main Card */}
            <div className="z-10 flex w-full max-w-6xl bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl mt-32 p-10 gap-12 transition-all duration-500">
                {/* Organiser Section */}
                <div className="w-1/2 min-h-[400px] flex flex-col items-center justify-center gap-8 p-8 rounded-2xl bg-white/5 hover:scale-105 transition-transform duration-300">
                    <h2 className="text-4xl font-bold text-purple-300 drop-shadow-sm">Organiser</h2>
                    <p className="text-center text-purple-100 px-4">
                        Join our platform to create, manage, and promote your events effortlessly!
                    </p>
                    <div className="flex flex-col gap-4 w-full items-center">
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-300 w-48"
                            onClick={() => navigate("/org/login")}
                        >
                            Login
                        </button>
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-300 w-48"
                            onClick={() => navigate("/org/signup")}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                {/* User Section */}
                <div className="w-1/2 min-h-[400px] flex flex-col items-center justify-center gap-8 p-8 rounded-2xl bg-white/5 hover:scale-105 transition-transform duration-300">
                    <h2 className="text-4xl font-bold text-blue-300 drop-shadow-sm">User</h2>
                    <p className="text-center text-blue-100 px-4">
                        Discover and join exciting events around you — all in one place!
                    </p>
                    <div className="flex flex-col gap-4 w-full items-center">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-300 w-48"
                            onClick={() => navigate("/usr/login")}
                        >
                            Login
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-300 w-48"
                            onClick={() => navigate("/usr/signup")}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginChoice;