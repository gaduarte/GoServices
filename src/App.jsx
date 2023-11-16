import React, { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter, NavLink } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import './App.css'
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
import { ClienteAdicionaCartao} from "./pages/Areas/ClientePage/AddCartao";
import { EmpresaAdicionaHorario } from "./pages/Areas/EmpresaPage/AddServiço/Horarios";
import QuemSomos from "./pages/goservicesInfos/SobreNos";
import Privacidade from "./pages/goservicesInfos/PoliticaPrivacidade";
import { ClienteAgendamentoDados } from "./pages/Areas/ClientePage/AgendamentosCliente";
import CartoesCliente from "./pages/Areas/ClientePage/AddCartao/cartoes/Cartoes";
import { CartoesdoCliente } from "./pages/Areas/ClientePage/AddCartao/cartoes";
import { EmpresaAgendamentoDados } from "./pages/Areas/EmpresaPage/AgendamentosEmpresa";
import { ProfissionalAgendamentoDados } from "./pages/Areas/ProfissionalPage/AgendamentoProfissional";


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
              <li><NavLink to="/infos">GoServices</NavLink></li>
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
                  <NavLink to="/agendamentosCliente">Meus Agendamentos</NavLink>
                ) : null}
              </li>
              <li>
              </li>
              <li>
                {userRole === "profissional" ? (
                  <NavLink to="/profissional">Perfil do Profissional</NavLink>
                ) : null}
              </li>
              <li>
                {userRole === "profissional" ? (
                  <NavLink to="/agendamentosProfissional">Relatório de Agendamentos</NavLink>
                ) : null}
              </li>
              <li>
              {userRole === "empresa" ? (
                  <NavLink to="/addServico">Adicionar Serviço</NavLink>
                ) : null}
              </li>
              <li>
                {userRole === "empresa" ? (
                  <NavLink to="/agendamentosEmpresa">Relatório de Agendamentos</NavLink>
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
          <Route path="/infos" element={<QuemSomos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/cadastro/*" element={<CadastrarUsuario />} />
          <Route path="/login" element={<LoginUsuario />} />
          {userRole === "cliente" && <Route path="/cliente/*" element={<ClienteDados />} />}
          {userRole === "cliente" && <Route path="/addCartao/*" element={<ClienteAdicionaCartao />} />}
          {userRole === "cliente" && <Route path="/cartoes/*" element={<CartoesdoCliente />} />}
          {userRole === "cliente" && <Route path="/agendamento/:servicoId" element={<AgendarDados />} />}
          {userRole === "cliente" && <Route path="/agendamentosCliente/*" element={<ClienteAgendamentoDados />} />}
          {userRole === "profissional" && <Route path="/profissional/*" element={<ProfissionalDados />} />}
          {userRole === "profissional" && <Route path="/agendamentosProfissional" element={<ProfissionalAgendamentoDados />}/>}
          {userRole === "empresa" && <Route path="/empresa/*" element={<EmpresaDados />} />}
          {userRole === "empresa" && <Route path="/addServico/*" element={<EmpresaAdicionaServ />} />}
          {userRole === "empresa" && <Route path="/atualizaServico/*" element={<EmpresaAtualiza/>} />}
          {userRole === "empresa" && <Route  path="/horarios/*" element={<EmpresaAdicionaHorario />}/>}
          {userRole === "empresa" && <Route path="/agendamentosEmpresa" element={<EmpresaAgendamentoDados />} />}
        </Routes>
      </div>

      <footer className="footer">
        <p>@Goservices; 2023 <br />
        <a href="/privacidade">Política de Privacidade</a>
        </p>
        <p></p>
      </footer>
    </BrowserRouter>
  );
}

export default App;



