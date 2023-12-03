import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col, Card, Button } from  "react-bootstrap";
import { useNavigate } from "react-router-dom";

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

const EmpresaPagamentos= () => {
    const [id, setId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [empresaInfo, setEmpresaInfo] = useState([]);
    const [agendamentoInfo, setAgendamentoInfo] = useState([]);
    const [clienteData, setClienteData] = useState(null);
    const [cartoesCliente, setCartoesCliente] = useState([]);
    const history = useNavigate();
  
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
  
    const clienteRef = collection(db, "cliente");
  
    const checkUserInEmpresaCollection = async (email) => {
      const db = getFirestore();
      const userRef = collection(db, "empresa");
      const q = query(userRef, where("email", "==", email));
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
    };
  
    useEffect(() => {
      checkUserRole();
    }, [history]);
  
    useEffect(() => {
      async function fetchEmpresaAgendamento() {
        try {
          setIsLoading(true);
          const auth = getAuth();
          const user = auth.currentUser;
          const uid = user ? user.uid : null;
  
          const agendamentoDoc = query(collection(db, "agendamento"), where("empresaId", "==", uid));
          const querySnapshot = await getDocs(agendamentoDoc);
          const agendamentoInfo = [];
  
          for (const docSnapshot of querySnapshot.docs) {
            const agendamentoData = docSnapshot.data();
  
            const servicoId = agendamentoData.servicoId;
            const servicoDocRef = doc(db, "servico", servicoId);
            const servicoDocSnapshot = await getDoc(servicoDocRef);
  
            const clienteId = agendamentoData.clienteId;
            const clienteDocRef = doc(db, "cliente", clienteId);
            const clienteDocSnapshot = await getDoc(clienteDocRef);
  
            const cartaoCollectionRef = collection(clienteDocRef, "cartao");
            const cartaoQuerySnapshot = await getDocs(cartaoCollectionRef);

            const cartoes = [];
            cartaoQuerySnapshot.forEach((cartaoDoc) => {
              cartoes.push({
                id: cartaoDoc.id,
                ...cartaoDoc.data(),
              });
            });

            agendamentoData.cartoes = cartoes;
  
            const horarioId = agendamentoData.dataAgendamento;
            const horarioDocRef = doc(db, "horariosDisponiveis", horarioId);
  
            const profissionalId = agendamentoData.profissionalId;
            const profissionalDocRef = doc(db, "profissional", profissionalId);
  
            // Espera todas as consultas assíncronas
            const [servicoData, clienteData, horarioData, profissionalData, cartaoData] = await Promise.all([
              servicoDocSnapshot.exists() ? servicoDocSnapshot.data() : null,
              clienteDocSnapshot.exists() ? clienteDocSnapshot.data() : null,
              getDoc(horarioDocRef).then(snapshot => snapshot.exists() ? snapshot.data() : null),
              getDoc(profissionalDocRef).then(snapshot => snapshot.exists() ? snapshot.data() : null),
            ]);
  
            agendamentoInfo.push({
              id: docSnapshot.id,
              ...agendamentoData,
              servico: servicoData,
              cliente: clienteData,
              horario: horarioData,
              profissional: profissionalData,
            });
          }
  
          setAgendamentoInfo(agendamentoInfo);
          setIsLoading(false);
  
        } catch (error) {
          console.error("Erro ao buscar informações: ", error);
          setIsLoading(false);
        }
      }
  
      fetchEmpresaAgendamento();
    }, [db]);
  
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
  
            setCartoesCliente(cartaoData);
          }
        } catch (error) {
          console.error("Erro ao buscar os clientes:", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchClientes();
    }, [setCartoesCliente]);

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
  
    return (
      <Container className="containerPagamentoCliente">
        <h2 className="h2title">Histórico Pagamentos, {empresaInfo.username}</h2>
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          <div className="pagamentoCliente">
            {agendamentoInfo.length > 0 ? (
              agendamentoInfo.map((agendamento, index) => {
                const formattedDataAgendamento = new Date(agendamento.horario.horario.seconds * 1000);
  
                return (
                  <Card key={index} className="mb-3 pmts-transaction-card">
                    <Card.Body className="cardColor pmts-transaction-info apx-transaction-date-container">
                      <Row>
                        <Col md={12}>
                          <h5 className="pmts-transaction-title">Detalhes do Pagamento</h5>
                        </Col>
                      </Row>
                      <Row className="pmts-transaction-info">
                        <Col md={6} className="colPagamento">
                          <strong>Data Agendamento: </strong>
                          {formattedDataAgendamento.toLocaleString()}
                        </Col>
                        <Col md={6} className="colPagamento">
                          <strong>Serviço: </strong>
                          {agendamento.servico.nome}
                        </Col>
                      </Row>
                     <Row className="pmts-transaction-info">
                        <Col md={6} className="colPagamento">
                        <strong>Cliente: </strong>
                        {agendamento.cliente.username}
                        </Col>
                     </Row>
                      {agendamento.cartoes.map((cartao, index) => (
                        <Row key={index} className="mb-3 pmts-transaction-info apx-transaction-date-container">
                            <Col md={3} style={{ color: "black" }}>
                            <strong style={{ color: "black" }}>Número do Cartão:</strong> {cartao.numero}
                            </Col>
                        </Row>
                        ))}
                    </Card.Body>
                  </Card>
                );
              })
            ) : (
              <p>Nenhum pagamento encontrado.</p>
            )}
          </div>
        )}
        <button className="buttonAg">
          <a href="/empresa/dados">Voltar</a>
        </button>
      </Container>
    );
      
}

export default EmpresaPagamentos;