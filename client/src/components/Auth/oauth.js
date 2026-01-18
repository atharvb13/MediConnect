// src/components/Auth/OAuthSuccess.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      navigate('/login');
      return;
    }

    // Store token
    localStorage.setItem('token', token);

    // OPTIONAL: fetch user info to decide redirect
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          'http://localhost:5001/api/auth/me',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const user = res.data;

        localStorage.setItem('userId', user._id);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('zip', user.zip);

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/chats', { replace: true });
        }

      } catch (err) {
        console.error('OAuth user fetch failed', err);
        navigate('/login');
      }
    };

    fetchUser();

  }, [location, navigate]);

  return <div>Signing you in with Google...</div>;
};

export default OAuthSuccess;
