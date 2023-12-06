import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Tab, Nav } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { getDoc, doc, getFirestore, getDocs } from "firebase/firestore";
import { NavLink, useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";


const firebaseConfig = {
    apiKey: "AIzaSyAjWrDAR_DACdqhq2P7nfnYI4H6M0YkX50",
    authDomain: "goservices-a0bf9.firebaseapp.com",
    databaseURL: "https://goservices-a0bf9-default-rtdb.firebaseio.com",
    projectId: "goservices-a0bf9",
    storageBucket: "goservices-a0bf9.appspot.com",
    messagingSenderId: "966186778726",
    appId: "1:966186778726:web:31e6300c46c447d03cada7",
    measurementId: "G-H7L211LBSZ"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EmpresaPerfil = () => {
  const [empresaInfo, setEmpresaInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState(null);
  const history = useNavigate();

  const checkUserInEmpresaCollection = async (email) => {
    const userRef = collection(db, "empresa");
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

useEffect(()=>{
    const auth = getAuth();

    auth.onAuthStateChanged(async function (user){
        if(user){
            const id = user.uid;
            setId(id);
        }else{
            history("/login");
        }
        setIsLoading(false);
    });
}, [history]);

const checkUserRole = async () => {
    try { 
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        history("/login");
      } else {
        const isEmpresa = await checkUserInEmpresaCollection(user.email);

        if (!isEmpresa) {
          history("/login");
        } else {
          sessionStorage.setItem("role", "empresa");
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar a função do usuário: ", error);
      setIsLoading(false);
    }
  }

useEffect(()=>{
    checkUserRole();
}, [history]);

  useEffect(()=>{
    async function fetchEmpresa(){
        try{
            setIsLoading(true);

            const auth = getAuth();
            const user = auth.currentUser;
            const uid = user ? user.uid : null;

            if(uid){
                const empresaDocRef = doc(db, "empresa", uid);

                const docSnapshot = await getDoc(empresaDocRef);

                if(docSnapshot.exists()){
                    const data = docSnapshot.data();
                    setEmpresaInfo(data);
                }
                setIsLoading(false);
            }
        }catch(error){
            console.error("Erro ao buscar informações: ", error);
            setIsLoading(false);
        }
    }
    fetchEmpresa();
}, []);

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      history("/login");
    });
  };

  return (
    <Container className="centeredFormPerfilCli">
      <h2>Suas Informações:</h2>
      {isLoading ? (
        <p>Carregando informações...</p>
      ) : (
        <div className="profileContainer">
          <div className="profileSidebar">
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <NavLink to="/empresa/*" className="nav-link toPerfil">
                  <i className="fas fa-user-circle"></i> Perfil
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink to="/addServico/*" className="nav-link toAddCartao">
                  <i className="fas fa-plus"></i> Adicionar Serviço
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink to="/atualizaServico/" className="nav-link toAtualizar"><i className="fas fa-sync"></i> Atualizar Serviço</NavLink>
            </Nav.Item>
              <Nav.Item>
                <NavLink to="/agendamentosEmpresa" className="nav-link toAgendamentos">
                  <i className="fas fa-history"></i> Relatório de Agendamentos
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink to="/empresa/pagamentos" className="nav-link toPagamentos">
                  <i className="fas fa-history"></i> Histórico Pagamentos
                </NavLink>
              </Nav.Item>
            </Nav>
            <Button onClick={handleLogout} className="logoutButton">
              Sair
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default EmpresaPerfil;