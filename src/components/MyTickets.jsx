import React, { useEffect } from 'react'
import { useUserContext } from '../contexts'
import { useNavigate } from 'react-router-dom';
function MyTickets() {
  const {isLoggedIn} = useUserContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
    // eslint-disable-next-line
  }, []);
  return (
    <div className="bg-gray-800">MyTickets</div>
  )
}

export default MyTickets