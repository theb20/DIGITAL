import { useLocation, useNavigate } from 'react-router-dom';
import NotAuthorized from '../pages/notAuthorized.jsx';
import { useEffect } from 'react';
import { getCookie } from './api/cookies.js';

export default function RequireAuth({ children, allowedRoles = [] }) {
  const email = getCookie('current_user_email');
  const storedRole = getCookie('role');
  const navigate = useNavigate();
  const location = useLocation();

  let role = null;

  // Priorité au rôle stocké côté client (défini après login)
  if (storedRole) {
    role = storedRole;
  }

  useEffect(() => {
    if (!email || (allowedRoles.length && !allowedRoles.includes(role))) {
      // Redirige vers login après 500ms
      const timer = setTimeout(() => {
        navigate('/sign', { replace: true, state: { from: location } });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [email, role, allowedRoles, navigate, location]);

  if (!email || (allowedRoles.length && !allowedRoles.includes(role))) {
    return <NotAuthorized />;
  }

  return children;
}
