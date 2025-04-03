import React, {useEffect} from 'react'
import { useUserContext } from '../contexts'
import { useNavigate } from 'react-router-dom';
function MyEvents() {
  const {isLoggedIn} = useUserContext();
    const navigate = useNavigate();
    useEffect(() => {
      if (!isLoggedIn) {
        navigate('/');
      }
      // eslint-disable-next-line
    }, []);
  return (
    <div>MyEvents</div>
  )
}

export default MyEvents