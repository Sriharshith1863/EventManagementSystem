import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginChoice() {
    const navigate = useNavigate();
    
    return (
        <div className="flex w-full min-h-screen bg-gray-900 justify-center items-center relative overflow-hidden pt-20">
            {/* Background decorative elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-indigo-600/5 rounded-full blur-lg"></div>

            <div className="z-10 flex w-full max-w-6xl">
                {/* Organiser Section */}
                <div className="w-1/2 flex flex-col items-center gap-6 p-6">
                    <h1 className="text-3xl font-bold text-white">Organiser</h1>
                    <button className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 transition duration-300"
                    onClick={() => navigate("/org/login")}>
                        Login
                    </button>
                    <button className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 transition duration-300"
                    onClick={() => navigate("/org/signup")}>
                        SignUp
                    </button>                    
                </div>

                {/* User Section */}
                <div className="w-1/2 flex flex-col items-center gap-6 p-6">
                    <h1 className="text-3xl font-bold text-white">User</h1>
                    <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    onClick={() => navigate("/usr/login")}>
                        Login
                    </button>
                    <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    onClick={() => navigate("/usr/signup")}>
                        SignUp
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginChoice;