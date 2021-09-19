import React, { useState, useContext, useEffect } from 'react';

export type LayoutContextType = {
  siderCollapsed: boolean;
  setSiderCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setBodyScroll: (scroll: boolean) => void;
  siderWidth: number;
  siderTransition: number;
};

const INIT_VALUE = {
  siderCollapsed: false,
  setSiderCollapsed: () => null,
  setBodyScroll: () => null,
  siderWidth: 200,
  siderTransition: 0.2,
};

const LayoutContext = React.createContext<LayoutContextType>(INIT_VALUE);

export function useHideBodyScrollWhenOnScreen() {
  const { setBodyScroll } = useContext(LayoutContext);
  useEffect(() => {
    setBodyScroll(false);
    return () => setBodyScroll(true);
  }, []);
}

export const LayoutContextProvider: React.FC = ({ children }) => {
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  const siderWidth = siderCollapsed ? 80 : 200;

  const setBodyScroll = (scroll: boolean) => {
    document.body.style.overflow = scroll ? '' : 'hidden';
  };

  return (
    <LayoutContext.Provider
      value={{
        siderCollapsed,
        setSiderCollapsed,
        setBodyScroll,
        siderWidth,
        siderTransition: INIT_VALUE.siderTransition,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;
