// import {useState} from 'react'
// import { useNavigate } from "react-router-dom";
// import { useUserContext } from '../contexts';
// function SignUp({type}) {
//     // eslint-disable-next-line no-unused-vars
//     const {username, setIsLoggedIn, setUsername} = useUserContext();
//         const [usernameLocal, setUsernameLocal] = useState("");
//         const [password, setPassword] = useState("");
//         const [confirmPassword, setConfirmPassword] = useState("");
//         const [errorMessage, setErrorMessage] = useState("");
//         const [dob, setDob] = useState("");
//         const navigate = useNavigate();
//         const signUp = (e) => {
//             e.preventDefault();
//             const checkUser = localStorage.getItem(usernameLocal+type);
//             if(!checkUser) {
//               //TODO: Encrypt the password
//               if(password === confirmPassword) {
//                 localStorage.setItem(usernameLocal+type, JSON.stringify({username: usernameLocal+type, password: password, dob: dob}));
//                 setUsername(usernameLocal+type);
//                 navigate("/home");
//                 setIsLoggedIn(true);
//                 setErrorMessage("");
//               }
//               else {
//                 setErrorMessage("Retype your password");
//                 setConfirmPassword("");
//               }
//             }
//             else {
//               setErrorMessage("Username is already in use, choose another one");
//             }
//         }

//   return (
//       <form onSubmit={signUp} className="flex flex-col justify-evenly bg-gray-800 flex-wrap text-gray-400 text-2xl mx-4 p-4 rounded-lg w-full">
//         <h1 className="text-center">{type=='usr'? "User" : "Organiser"}</h1>
//         <p className="text-red-600">{errorMessage}</p>
//         <label htmlFor='username'>Username </label>
//         <input
//         type="text"
//         required={true}
//         value={usernameLocal}
//         onChange={(e) => setUsernameLocal(e.target.value)}
//         className="border rounded-sm focus:ring-blue-500 focus:ring-2 focus:border-none outline-none"
//         />
//         <label htmlFor='password'>Password </label>
//         <input
//         type="password"
//         required={true}
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         className="border rounded-sm focus:ring-blue-500 focus:ring-2 focus:border-none outline-none"
//         />
//         <label htmlFor='confirmPassword'>Confirm Password </label>
//         <input
//         type="password"
//         required={true}
//         value={confirmPassword}
//         onChange={(e) => setConfirmPassword(e.target.value)}
//         className="border rounded-sm focus:ring-blue-500 focus:ring-2 focus:border-none outline-none"
//         />
//         <label htmlFor='dob'>Date of birth: </label>
//         <input
//         type="date"
//         required={true}
//         value={dob}
//         onChange={(e) => setDob(e.target.value)}
//         className="border rounded-sm focus:ring-blue-500 focus:ring-2 focus:border-none outline-none"
//         />
//         <button type="submit" className="bg-purple-700 py-1">SignUp</button>
//     </form>
//   )
// }

// export default SignUp


import {useState} from 'react'
import { useNavigate } from "react-router-dom";
import { useUserContext } from '../contexts';
function SignUp({type}) {
    // eslint-disable-next-line no-unused-vars
    const {username, setIsLoggedIn, setUsername} = useUserContext();
        const [usernameLocal, setUsernameLocal] = useState("");
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const [errorMessage, setErrorMessage] = useState("");
        const [dob, setDob] = useState("");
        const navigate = useNavigate();
        const signUp = (e) => {
            e.preventDefault();
            const checkUser = localStorage.getItem(usernameLocal+type);
            if(!checkUser) {
              //TODO: Encrypt the password
              if(password === confirmPassword) {
                localStorage.setItem(usernameLocal+type, JSON.stringify({username: usernameLocal+type, password: password, dob: dob}));
                setUsername(usernameLocal+type);
                navigate("/home");
                setIsLoggedIn(true);
                setErrorMessage("");
              }
              else {
                setErrorMessage("Retype your password");
                setConfirmPassword("");
              }
            }
            else {
              setErrorMessage("Username is already in use, choose another one");
            }
        }

  return (
      <form onSubmit={signUp} className="flex flex-col gap-3 justify-evenly bg-gray-800 flex-wrap text-gray-300 text-lg mx-4 p-6 rounded-lg w-full shadow-lg border border-gray-700">
        <h1 className="text-center text-2xl font-semibold text-purple-400 mb-2">{type=='usr'? "User Sign Up" : "Organiser Sign Up"}</h1>
        {errorMessage && <p className="text-red-400 bg-red-900/20 p-2 rounded">{errorMessage}</p>}
        <label htmlFor='username' className="font-medium">Username</label>
        <input
        type="text"
        required={true}
        value={usernameLocal}
        onChange={(e) => setUsernameLocal(e.target.value)}
        className="border border-gray-600 bg-gray-700 rounded px-3 py-2 focus:ring-purple-500 focus:ring-2 focus:border-purple-500 outline-none text-gray-200"
        />
        <label htmlFor='password' className="font-medium">Password</label>
        <input
        type="password"
        required={true}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-gray-600 bg-gray-700 rounded px-3 py-2 focus:ring-purple-500 focus:ring-2 focus:border-purple-500 outline-none text-gray-200"
        />
        <label htmlFor='confirmPassword' className="font-medium">Confirm Password</label>
        <input
        type="password"
        required={true}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="border border-gray-600 bg-gray-700 rounded px-3 py-2 focus:ring-purple-500 focus:ring-2 focus:border-purple-500 outline-none text-gray-200"
        />
        <label htmlFor='dob' className="font-medium">Date of birth</label>
        <input
        type="date"
        required={true}
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        className="border border-gray-600 bg-gray-700 rounded px-3 py-2 focus:ring-purple-500 focus:ring-2 focus:border-purple-500 outline-none text-gray-200"
        />
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 mt-2 rounded-md transition duration-200 shadow-md">Sign Up</button>
    </form>
  )
}

export default SignUp