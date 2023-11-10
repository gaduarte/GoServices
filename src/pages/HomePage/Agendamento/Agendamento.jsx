import React, { useEffect, useRef, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

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

const Agendamento = () => {
  const { servicoId } = useParams();
  const [servicoData, setServicoData] = useState(null);
  const [clienteData, setClienteData] = useState(null);
  const [cartao, setCartaoCliente] = useState(null);
  const [empresaData, setEmpresaData] = useState(null);
  const [profissionalData, setProfissionalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const history = useNavigate();

  const servicoRef = collection(db, "servico");
  const clienteRef = collection(db, "cliente");
  const empresaRef = collection(db, "empresa");
  const profissionalRef = collection(db, "profissional");

  const checkUserInClienteCollection = async (email) => {
    const usersRef = collection(db, "cliente");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const checkUserRole = async () => {
    try {
      // Verifica se o usuário está logado
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        history("/login");
      } else {
        // Obtém o email do usuário logado
        const email = user.email;

        // Consulta a coleção "cliente" com base no email do usuário logado
        const q = query(clienteRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Define o cliente logado
          const cliente = querySnapshot.docs[0].data();
          setClienteData(cliente);
        } else {
          history("/login");
        }
      }
    } catch (error) {
      console.error("Erro ao verificar a função do usuário: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserRole();
  }, [history]);

  useEffect(() => {
    async function fetchServico() {
      try {
        const querySnapshot = await getDocs(servicoRef);
        querySnapshot.forEach((doc) => {
          if (doc.id === servicoId) {
            setServicoData(doc.data());
          }
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar Serviço", error);
        setIsLoading(false);
      }
    }
    if (servicoId) {
      fetchServico();
    }
  }, [servicoId]);

  useEffect(() => {
    async function fetchClientes() {
      try {
        setIsLoading(true);
  
        const auth = getAuth();
        const user = auth.currentUser;
        const uid = user ? user.uid : null;
  
        if (uid) {
          const clienteRef = doc(db, "cliente", uid);
  
          const docSnapshot = await getDoc(clienteRef);
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setClienteData(data);
          }
  
          const cartaoQuerySnapshot = await getDocs(collection(clienteRef, "cartao"));
          const cartaoData = cartaoQuerySnapshot.docs.map((cartaoDoc) => ({
            id: cartaoDoc.id,
            ...cartaoDoc.data(),
          }));
  
          // Adicionando o estado de cartões
          setCartaoCliente(cartaoData);
        }
      } catch (error) {
        console.error("Erro ao buscar os clientes:", error);
      } finally {
        setIsLoading(false); 
      }
    }
  
    fetchClientes();
  }, []);
  

  useEffect(() => {
    async function fetchEmpresa(empresaId) {
      try {
        const querySnapshot = await getDocs(empresaRef);
        const empresasData = [];
        querySnapshot.forEach((doc) => {
          empresasData.push({ id: doc.id, data: doc.data() });
        });
      
      } catch (error) {
        console.error("Erro ao buscar as empresas:", error);
      }
    }
   
  }, []);

  useEffect(() => {
    async function fetchProfissional(profissionalId) {
      try {
        const querySnapshot = await getDocs(profissionalRef);
        const profissionaisData = [];
        querySnapshot.forEach((doc) => {
          profissionaisData.push({ id: doc.id, data: doc.data() });
        });
       
      } catch (error) {
        console.error("Erro ao buscar os profissionais:", error);
      }
    }
    
  }, []);

  const handleAgendamento = async () => {
    try {
      
      const agendamentoData = {
        clienteId: clienteData.id, 
        empresaId: servicoData.empresaId,
        profissionalId: servicoData.profissionalId,
        servicoId: servicoId,
        dataAgendamento: Timestamp.fromDate(new Date()), 
      };

      const agendamentoRef = collection(db, "agendamento");

      const docRef = await addDoc(agendamentoRef, agendamentoData);
      console.log("Agendamento adicionado com sucesso! Document ID: ", docRef.id);
    } catch (error) {
      console.error("Erro ao adicionar agendamento: ", error);
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <div className="card-container" style={{
          backgroundColor: "#ffc0cb",
          padding: "10px",
          margin: "0 auto",
          border: "1px solid #ddd",
          borderRadius: "10px",
          width: "50vw",
          height: "auto",
          display: "flex",
          flexDirection: "column",
          marginTop: "100px"
        }}>
          {servicoData && servicoData.img && (
            <img src={servicoData.img} alt={servicoData.nome} style={{ width: "200px", height: "100px", marginBottom: "-20px" }} />
          )}
          <div className="card-body" style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ marginBottom: "-10px" }}>
              <h5 className="card-title" style={{ fontSize: "24px", lineHeight: "32px", color: "#0F1111", fontWeight: "400", textRendering: "optimizeLegibility", marginBottom: "-10px" }}>
                {servicoData.nome}
              </h5>
              <p style={{ fontSize: "16px", display: "flex", color: "#0F1111" }}>{servicoData.empresa}</p>
              <p style={{ fontSize: "16px", display: "flex", color: "#0F1111" }}>{clienteData && clienteData.username}</p>
              {clienteData && clienteData.cartao && (
              <div>
                <p>Número do Cartão: {clienteData.cartao.numero}</p>
                <p>Nome no Cartão: {clienteData.cartao.nome}</p>
                <p>Data de Validade: {clienteData.cartao.dataValidade}</p>
               
              </div>
            )}
              <button onClick={handleAgendamento}>Agendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  

}

export default Agendamento;


