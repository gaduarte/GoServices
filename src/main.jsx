import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './App.css'
import { CadastroProvider } from './pages/Cadastro/Cadastro_Cliente/CadastroClienteContext.jsx'
import { CadastroProfissionalProvider } from './pages/Cadastro/Cadastro_Profissional/CadastroProfissionalContext.jsx'
import { CadastroEmpresaProvider } from './pages/Cadastro/Cadastro_Empresa/CadastroEmpresaContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CadastroProvider>
      <CadastroEmpresaProvider>
      <CadastroProfissionalProvider>
    <App />
    </CadastroProfissionalProvider>
    </CadastroEmpresaProvider>
    </CadastroProvider>
  </React.StrictMode>,
)
