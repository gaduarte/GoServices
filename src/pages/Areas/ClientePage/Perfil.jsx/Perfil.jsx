import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Tab, Nav } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { getDoc, doc, getFirestore } from "firebase/firestore";
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

const ClientePerfil = () => {
  const [clientInfo, setClientInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState(null);
  const history = useNavigate();

  const checkUserInClienteCollection = async (email) => {
    const db = getFirestore();
    const usersRef = collection(db, "cliente");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  useEffect(() => {
    const auth = getAuth();

    auth.onAuthStateChanged(async function (user) {
      if (user) {
        const id = user.uid;
        setId(id);
      } else {
        history("/login");
      }
      setIsLoading(false);
    });
  }, [history]);

  const checkUserRole = async () => {
    try{
        const auth = getAuth();
        const user = auth.currentUser;

        if(!user){
            history("/login");
        }else {
            const isCliente = await checkUserInClienteCollection(user.email);

            if(!isCliente){
                history("/login");
            }else {
                sessionStorage.setItem("role", "cliente");
                setIsLoading(false);
            }
        }
    }catch (error) {
        console.error("Erro ao verificar a função do usuário: ", error);
        setIsLoading(false);
      }
}

useEffect(()=>{
    checkUserRole();
}, [history]);

  useEffect(() => {
    async function fetchCliente() {
      try {
        setIsLoading(true);

        const auth = getAuth();
        const user = auth.currentUser;
        const uid = user ? user.uid : null;

        if (uid) {
          const db = getFirestore();
          const clienteDocRef = doc(db, "cliente", uid);

          const docSnapshot = await getDoc(clienteDocRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setClientInfo(data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao buscar informações: ", error);
        setIsLoading(false);
      }
    }
    fetchCliente();
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
                <NavLink to="/cliente/*" className="nav-link toPerfil">
                  <i className="fas fa-user-circle"></i> Perfil
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink to="/addCartao" className="nav-link toAddCartao">
                  <i className="fas fa-credit-card"></i> Adicionar Cartão
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink to="/agendamentosCliente/*" className="nav-link toAgendamentos">
                  <i className="fas fa-calendar"></i> Agendamentos
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink to="/pagamentos" className="nav-link toPagamentos">
                  <i className="fas fa-credit-card"></i> Seus Pagamentos
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink to="/favoritosCliente" className="nav-link toFavoritos">
                  <i className="fas fa-heart"></i> Favoritos
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

export default ClientePerfil;
