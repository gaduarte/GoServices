import React, { createContext, useContext, useReducer } from "react";

const cadastroEmpresaContext = createContext(null);
const cadastroEmpresaDispatch = createContext(null);

export function CadastroEmpresaProvider({children}){
    const [cadastros, dispatch] = useReducer(cadastroReducer, []);

    return(
        <cadastroEmpresaContext.Provider value={cadastros}>
            <cadastroEmpresaDispatch.Provider value={dispatch}>{children}</cadastroEmpresaDispatch.Provider>
        </cadastroEmpresaContext.Provider>
    )
}

export function useCadastroEmpresaDispatch(){
    return useContext(cadastroEmpresaDispatch);
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