import { Outlet, useLocation } from 'react-router-dom';
import { usePopup } from '../configurations/PopupContext.jsx';
import Header from './header.jsx';
import Footer from './Footer.jsx';
import Quote from './quote.jsx';
import Cookie from './Cookie.jsx';
import PostLoginChoice from './PostLoginChoice.jsx';

export default function Layout() {
  const { activePopup, setActivePopup, closePopup } = usePopup();
  const location = useLocation();
  
  // Routes où le header et le footer doivent être cachés
  const noHeaderFooterRoutes = [
    '/admin',
    '/login',
    '/dashboard',
    '/sign',
    // Ajoutez d'autres routes si nécessaire
  ];
  
  const shouldHideHeaderFooter = noHeaderFooterRoutes.some((path) =>
    location.pathname.startsWith(path)
  );
  
  const popupComponents = {
    quote: <Quote closePopup={closePopup} />,
    postLoginChoice: <PostLoginChoice closePopup={closePopup} />,
  };
  
  return (
    <div className="min-h-screen relative h-full">
      {/* Header */}
      {!shouldHideHeaderFooter && <Header openPopup={setActivePopup} />}
      
      <main>
        <Outlet />
      </main>
      
      {!shouldHideHeaderFooter && <Cookie />}
      {!shouldHideHeaderFooter && !activePopup && <Footer openPopup={setActivePopup} />}
      
      {/* Popups dynamiques */}
      {activePopup && popupComponents[activePopup]}
     
    </div>
  );
}
