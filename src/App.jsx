import React, { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter, NavLink } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import './App.css'
import CadastrarUsuario from "./pages/Cadastro";
import LoginUsuario from "./pages/Cadastro/LoginPage";
import { ClienteDados } from "./pages/Areas/ClientePage";
import { EmpresaDados } from "./pages/Areas/EmpresaPage";

function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        //await initializeApp(appF);
        setFirebaseReady(true);
      } catch (error) {
        console.error(error);
      }
    };
    checkFirebase();
  }, []);

  if (!firebaseReady) {
    return <div>Carregando Firebase....</div>
  }

  const checkUserRole = (allowRoles) => {
    const userRole = sessionStorage.getItem("role");
    return allowRoles.includes(userRole);
  }

  return (
    <div>
      <BrowserRouter>
        <header className="my-header">
          <nav>
            <ul className="my-list">
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li>
                <NavLink to="/cliente">Minha Conta</NavLink>
              </li>
              <li>
                <NavLink to="/empresa">Empresa</NavLink>
              </li>
              <li>
                <NavLink to="/cadastro">Cadastrar-se</NavLink>
              </li>
              <li>
                <NavLink to="/login">Login</NavLink>
              </li>
            </ul>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cadastro/*" element={<CadastrarUsuario />} />
          <Route path="/login" element={<LoginUsuario />} />
          <Route path="cliente/*" element={<ClienteRoutes />} />
          <Route path="empresa/*" element={<EmpresaRoutes />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function ClienteRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ClienteDados />} />
      {/* Adicione mais rotas de cliente, se necessário */}
    </Routes>
  );
}

function EmpresaRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EmpresaDados />} />
      {/* Adicione mais rotas de empresa, se necessário */}
    </Routes>
  );
}

export default App;


