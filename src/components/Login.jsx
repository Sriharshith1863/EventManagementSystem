import React, {useState} from 'react'
import { useNavigate, NavLink } from 'react-router-dom';
import { useUserContext } from '../contexts';
function Login({type}) {
    //TODO: remove the username and setUsername if it is not needed
    // eslint-disable-next-line no-unused-vars
    const {username, setIsLoggedIn, setUsername} = useUserContext();
    const [usernameLocal, setUsernameLocal] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate= useNavigate();
    const loginUser = (e) => {
        e.preventDefault();
        const checkUser = localStorage.getItem(usernameLocal+type);
        const userDetails = JSON.parse(checkUser);
        if(!checkUser) {
            setErrorMessage("Invalid username or password");
            setUsernameLocal("");
            setPassword("");
            return;
        }
        else if(userDetails.password !== password) {//TODO: have to encrypt the password
            setErrorMessage("Incorrect password");
            setPassword("");
            return;
        }
        setUsername(usernameLocal+type);
        navigate("/home");
        setIsLoggedIn(true);
        setErrorMessage("");
    }
  return (
    <form onSubmit={loginUser} className="flex flex-col flex-wrap justify-evenly bg-gray-800 text-gray-500 text-2xl mx-8 p-4 rounded-lg w-full">
        <h1 className="text-center">{type=='usr'? "User" : "Organiser"}</h1>
        <p className="text-red-600">{errorMessage}</p>
        <label htmlFor='username'>Username </label>
        <input
        type="text"
        required={true}
        value={usernameLocal}
        onChange={(e) => setUsernameLocal(e.target.value)}
        className="border rounded-sm focus:ring-blue-500 focus:ring-2 focus:border-none outline-none w-full py-1"
        />
        <label htmlFor='password'>Password </label>
        <input
        type="password"
        required={true}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded-sm focus:ring-blue-500 focus:ring-2 focus:border-none outline-none py-1 w-full"
        />
        <button type="submit" className="bg-purple-700 py-2">Login</button>
        <p>Don't have an account? <NavLink to='/signUp' className="underline text-blue-700">SignUp</NavLink></p>
    </form>
  )
}

export default Login;