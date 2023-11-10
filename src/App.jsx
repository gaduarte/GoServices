import React, { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter, NavLink } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import './App.css'
import './index.css'
import CadastrarUsuario from "./pages/Cadastro";
import LoginUsuario from "./pages/Cadastro/LoginPage";
import { ClienteDados } from "./pages/Areas/ClientePage";
import { EmpresaDados } from "./pages/Areas/EmpresaPage";
import { ProfissionalDados } from "./pages/Areas/ProfissionalPage";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, setDoc, query, where } from "firebase/firestore";
import { SearchT } from "./pages/Search/Search";
import { EmpresaAdicionaServ } from "./pages/Areas/EmpresaPage/AddServiço";
import { EmpresaAtualiza } from "./pages/Areas/EmpresaPage/AtualizarServiço";
import { AgendarDados } from "./pages/HomePage/Agendamento";
import ClienteAddServico from "./pages/Areas/ClientePage/AddCartao/AddCartao";
import { ClienteAdicionaCartao } from "./pages/Areas/ClientePage/AddCartao";


function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const checkUserInProfissionalCollection = async (email) => {
    const db = getFirestore();
    const userRef = collection(db, "profissional");
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const checkUserInEmpresaCollection = async (email) => {
    const db = getFirestore();
    const userRef = collection(db, "empresa");
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const checkUserInClienteCollection = async (email) => {
    const db = getFirestore();
    const usersRef = collection(db, "cliente");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Inicialize seu Firebase aqui
        setFirebaseReady(true);
      } catch (error) {
        console.error(error);
      }
    };
    checkFirebase();
  }, []);

  useEffect(() => {
    const auth = getAuth();

    onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // O usuário está autenticado
        setUser(authUser);
        const isProfissional = await checkUserInProfissionalCollection(authUser.email);
        const isCliente = await checkUserInClienteCollection(authUser.email);
        const isEmpresa = await checkUserInEmpresaCollection(authUser.email);

        if (isProfissional) {
          setUserRole("profissional");
        } else if (isCliente) {
          setUserRole("cliente");
        } else if (isEmpresa) {
          setUserRole("empresa");
        } else {
          setUserRole(null);
        }
      } else {
        // O usuário não está autenticado
        setUser(null);
        setUserRole(null);
      }
    });
  }, []);

  if (!firebaseReady) {
    return <div>Carregando Firebase....</div>
  }

  return (
    <BrowserRouter>
      <div>
        <header className="my-header">
          <nav>
            <ul className="my-list">
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li>
                {userRole === "cliente" ? (
                  <NavLink to="/cliente">Meu Perfil</NavLink>
                ) : null}
              </li>
              <li>
              {userRole === "cliente" ? (
                  <NavLink to="/addCartao">Adicionar Cartão</NavLink>
                ) : null}
              </li>
              <li>
                {userRole === "profissional" ? (
                  <NavLink to="/profissional">Perfil do Profissional</NavLink>
                ) : null}
              </li>
              <li>
              {userRole === "empresa" ? (
                  <NavLink to="/addServico">Adicionar Serviço</NavLink>
                ) : null}
              </li>
              <li>
              {userRole === "empresa" ? (
                  <NavLink to="/atualizaServiço">Atualizar Serviço</NavLink>
                ) : null}
              </li>
              <li>
                {userRole === "empresa" ? (
                  <NavLink to="/empresa">Minha Área</NavLink>
                ) : null}
                {user ? null : <NavLink to="/cadastro">Cadastrar-se</NavLink>}
              </li>
              <li>
                {user ? null : <NavLink to="/login">Login</NavLink>}
              </li>
              <li>
                  <SearchT />
              </li>
            </ul>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cadastro/*" element={<CadastrarUsuario />} />
          <Route path="/login" element={<LoginUsuario />} />
          {userRole === "cliente" && <Route path="/cliente/*" element={<ClienteDados />} />}
          {userRole === "cliente" && <Route path="/addCartao/*" element={<ClienteAdicionaCartao />} />}
          {userRole === "cliente" && <Route path="/agendamento/:servicoId" element={<AgendarDados />} />}
          {userRole === "profissional" && <Route path="/profissional/*" element={<ProfissionalDados />} />}
          {userRole === "empresa" && <Route path="/empresa/*" element={<EmpresaDados />} />}
          {userRole === "empresa" && <Route path="/addServico/*" element={<EmpresaAdicionaServ />} />}
          {userRole === "empresa" && <Route path="/atualizaServiço/*" element={<EmpresaAtualiza/>} />}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;



