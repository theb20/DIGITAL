import { createContext, useContext, useState } from 'react';

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [activePopup, setActivePopup] = useState(null);
  const [popupPayload, setPopupPayload] = useState(null);

  const openPopup = (name, payload = null) => {
    setPopupPayload(payload || null);
    setActivePopup(name);
  };

  const closePopup = () => {
    setActivePopup(null);
    setPopupPayload(null);
  };

  return (
    <PopupContext.Provider 
      value={{ 
        activePopup, 
        setActivePopup, 
        openPopup,
        closePopup, 
        popupPayload 
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  
  if (!context) {
    throw new Error('usePopup doit être utilisé à l\'intérieur de PopupProvider');
  }
  
  return context;
};