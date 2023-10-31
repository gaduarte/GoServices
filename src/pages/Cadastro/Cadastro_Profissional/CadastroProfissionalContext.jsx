import React, { createContext, useContext, useReducer } from "react";

const cadastroProfissionalContext = createContext(null);
const cadastroProfissionalDispatch = createContext(null);

export function CadastroProfissionalProvider({children}){
    const [cadastros, dispatch] = useReducer(cadastroReducer, []);

    return(
        <cadastroProfissionalContext.Provider value={cadastros}>
            <cadastroProfissionalDispatch.Provider value={dispatch}>
                {children}
            </cadastroProfissionalDispatch.Provider>
        </cadastroProfissionalContext.Provider>
    )
}

export function useCadastroProfissionalDispatch(){
    return useContext(cadastroProfissionalDispatch);
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