import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts'

function Profile() {
  const { username, isLoggedIn, userEvents } = useUserContext();
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [isEditable, setIsEditable] = useState(false);
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("text-red-500");
  const [dob, setDob] = useState("");
  const navigate = useNavigate();

  const displayMessage = (messageToDisplay, colorToDisplay) => {
    setMessage(messageToDisplay);
    setColor(colorToDisplay);
    setTimeout(() => {
      setMessage("");
      setColor("");
    }, 3000);
  }

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signUp');
    }
    const loadDetails = JSON.parse(localStorage.getItem(username));
    if (!loadDetails) {
      navigate('/signUp');
    }
    if (loadDetails.email) {
      setEmail(loadDetails.email);
    }
    if (loadDetails.phoneNumber) {
      setPhoneNo(loadDetails.phoneNumber);
    }
    if (loadDetails.dob) {
      setDob(loadDetails.dob);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editProfile = (e) => {
    e.preventDefault();
    if (isEditable) {
      let userDetails = localStorage.getItem(username);
      if (!userDetails) {
        displayMessage("Something went wrong...", "text-red-500");
      }
      else {
        userDetails = JSON.parse(userDetails);
        localStorage.setItem(username, JSON.stringify({ ...userDetails, email: email, phoneNumber: phoneNo, dob: dob, userEvents}));
        setIsEditable(false);
        displayMessage("Profile successfully edited!", "text-green-500");
      }
    }
    else {
      setIsEditable((prev) => !prev);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Notification Message */}
      {message && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg ${color === "text-green-500" ? "bg-green-900/70" : "bg-red-900/70"}`}>
          <p className={`font-medium ${color}`}>{message}</p>
        </div>
      )}

      <div className="max-w-8xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-indigo-400">User Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="relative group">
              <img 
                src="/defaultAvatar.webp" 
                alt="avatar" 
                className="h-48 w-48 rounded-full object-cover border-4 border-indigo-500/50"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm">Change Photo</span>
              </div>
            </div>
            <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md">
              Upload Photo
            </button>
          </div>

          {/* Profile Form */}
          <div className="md:col-span-2">
            <form 
              className="bg-gray-800 rounded-xl shadow-lg overflow-hidden" 
              onSubmit={editProfile}
            >
              {/* Header with Edit Button */}
              <div className="flex items-center justify-between bg-gray-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-indigo-300">Personal Information</h2>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-medium shadow-md transition-colors duration-200
                    ${isEditable 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                >
                  {isEditable ? "Save Changes" : "Edit Profile"}
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-400">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username.substring(0, username.length-3)}
                    readOnly={true}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {setEmail(e.target.value)}}
                    placeholder="example@email.com"
                    readOnly={!isEditable}
                    required={true}
                    className={`w-full px-4 py-2 bg-gray-700/50 border rounded-lg text-gray-300 focus:outline-none transition-colors duration-200
                      ${isEditable 
                        ? "border-indigo-500 focus:ring-2 focus:ring-indigo-500/50" 
                        : "border-gray-600"}`}
                  />
                </div>

                {/* Date of Birth Field */}
                <div className="space-y-2">
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-400">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => {setDob(e.target.value)}}
                    readOnly={!isEditable}
                    required={true}
                    className={`w-full px-4 py-2 bg-gray-700/50 border rounded-lg text-gray-300 focus:outline-none transition-colors duration-200
                      ${isEditable 
                        ? "border-indigo-500 focus:ring-2 focus:ring-indigo-500/50" 
                        : "border-gray-600"}`}
                  />
                </div>

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-400">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNo}
                    onChange={(e) => {setPhoneNo(e.target.value)}}
                    placeholder="1234567890"
                    readOnly={!isEditable}
                    required={true}
                    className={`w-full px-4 py-2 bg-gray-700/50 border rounded-lg text-gray-300 focus:outline-none transition-colors duration-200
                      ${isEditable 
                        ? "border-indigo-500 focus:ring-2 focus:ring-indigo-500/50" 
                        : "border-gray-600"}`}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile