import React, { createContext, useContext, useReducer } from "react";

const CadastroClienteContext = createContext(null);
const CadastroClienteDispatch = createContext(null);

export function CadastroProvider({ children }) {
  const [cadastros, dispatch] = useReducer(cadastroReducer);

  return (
    <CadastroClienteContext.Provider value={cadastros}>
      <CadastroClienteDispatch.Provider value={dispatch}>
        {children}
      </CadastroClienteDispatch.Provider>
    </CadastroClienteContext.Provider>
  );
}

export function useCadastroDispatch() {
  return useContext(CadastroClienteDispatch);
}

function cadastroReducer(cadastros, action) {
  switch (action.type) {
    case 'added': {
      return [
        ...cadastros,
        {
          id: action.id,
          text: action.text,
        },
      ];
    }
    default: {
      return cadastros;
    }
  }
}