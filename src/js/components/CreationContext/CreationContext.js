import React, { createContext } from 'react';

const Context = createContext();

export const CreationProvider = ({ selectedElement, children }) => {
  const contextValue = {
    selectedElement,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export function useSelectedElement() {
  const context = React.useContext(Context);

  return context.selectedElement;
}
