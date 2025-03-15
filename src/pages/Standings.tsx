
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Standings = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to teams page
    navigate('/teams', { replace: true });
  }, [navigate]);
  
  return null;
};

export default Standings;
