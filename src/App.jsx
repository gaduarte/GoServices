import React, { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter, NavLink } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import './App.css'
import CadastrarUsuario from "./pages/Cadastro";
import LoginUsuario from "./pages/Cadastro/LoginPage";
import { ClienteDados } from "./pages/Areas/ClientePage";
import { EmpresaDados } from "./pages/Areas/EmpresaPage";
import { ProfissionalDados } from "./pages/Areas/ProfissionalPage";
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Importe as funções do Firebase Auth

function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        // O usuário está autenticado
        setUser(user);
      } else {
        // O usuário não está autenticado
        setUser(null);
      }
    });
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
                {user ? <NavLink to="/cliente">Meu Perfil</NavLink> : null}
              </li>
              <li>
                {user ? <NavLink to="/empresa">Minha Área</NavLink> : null}
              </li>
              <li>
                {user ? null : <NavLink to="/cadastro">Cadastrar-se</NavLink>}
              </li>
              <li>
                {user ? null : <NavLink to="/login">Login</NavLink>}
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
          <Route path="profissional/*" element={<ProfissionalRoutes />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function ClienteRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ClienteDados />} />
    </Routes>
  )
}

function EmpresaRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EmpresaDados />} />
    </Routes>
  )
}

function ProfissionalRoutes(){
  return(
    <Routes>
      <Route path="/" element={<ProfissionalDados />} />
    </Routes>
  )
}

export default App;



