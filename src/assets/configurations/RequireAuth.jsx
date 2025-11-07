import { useLocation } from 'react-router-dom';
import Sign from '../pages/sign.jsx';
import { useEffect, useState } from 'react';
import { getCookie } from './api/cookies.js';

export default function RequireAuth({ children }) {
  const email = getCookie('current_user_email');
  const location = useLocation();

  useEffect(() => {
    if (!email) {
      // Rediriger vers la page de connexion après 3 secondes
      const timer = setTimeout(() => {
        //window.location.href = '/login';
      });
      return () => clearTimeout(timer);
    }
  }, [email]);

  if (!email) {
    return <Sign />;
  }
  return children;
}
