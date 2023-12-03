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

const ClientePagamentos= () => {
    const [id, setId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [clienteInfo, setClienteInfo] = useState([]);
    const [agendamentoInfo, setAgendamentoInfo] = useState([]);
    const [clienteData, setClienteData] = useState(null);
    const [cartoesCliente, setCartoesCliente] = useState([]);
    const history = useNavigate();

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const clienteRef = collection(db, "cliente");

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
        async function fetchClienteAgendamento() {
            try {
                setIsLoading(true);
                const auth = getAuth();
                const user = auth.currentUser;
                const uid = user ? user.uid : null;
    
                const agendamentoDoc = query(collection(db, "agendamento"), where("clienteId", "==", uid));
                const querySnapshot = await getDocs(agendamentoDoc);
                const agendamentoInfo = [];
    
                for (const docSnapshot of querySnapshot.docs) {
                    const agendamentoData = docSnapshot.data();
    
                    const servicoId = agendamentoData.servicoId;
                    const servicoDocRef = doc(db, "servico", servicoId);
                    const servicoDocSnapshot = await getDoc(servicoDocRef);
    
                    const empresaId = agendamentoData.empresaId;
                    const empresaDocRef = doc(db, "empresa", empresaId);
                    const empresaDocSnapshot = await getDoc(empresaDocRef);
    
                    const horarioId = agendamentoData.dataAgendamento;
                    const horarioDocRef = doc(db, "horariosDisponiveis", horarioId);
    
                    const profissionalId = agendamentoData.profissionalId;
                    const profissionalDocRef = doc(db, "profissional", profissionalId);
    
                    // Espera todas as consultas assíncronas
                    const [servicoData, empresaData, horarioData, profissionalData] = await Promise.all([
                        servicoDocSnapshot.exists() ? servicoDocSnapshot.data() : null,
                        empresaDocSnapshot.exists() ? empresaDocSnapshot.data() : null,
                        getDoc(horarioDocRef).then(snapshot => snapshot.exists() ? snapshot.data() : null),
                        getDoc(profissionalDocRef).then(snapshot => snapshot.exists() ? snapshot.data() : null),
                    ]);
    
                    agendamentoInfo.push({
                        id: docSnapshot.id,
                        ...agendamentoData,
                        servico: servicoData,
                        empresa: empresaData,
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
    
        fetchClienteAgendamento();
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

    useEffect(() => {
        async function fetchCartoesCliente() {
          try {
            setIsLoading(true);
      
            if (clienteData && clienteData.id) {
              // Consulta a subcoleção "cartao" dentro do documento do cliente
              const clienteId = clienteData.id; // Obtenha o ID do cliente
              const cartaoQuery = query(collection(clienteRef, clienteId, "cartao"));
              const cartaoSnapshot = await getDocs(cartaoQuery);
      
              if (!cartaoSnapshot.empty) {
                const cartoes = [];
                cartaoSnapshot.forEach((doc) => {
                  cartoes.push(doc.data());
                });
                setCartoesCliente(cartoes);
              }
            }
          } catch (error) {
            console.error("Erro ao buscar os cartões do cliente:", error);
          } finally {
            setIsLoading(false);
          }
        }
      
        fetchCartoesCliente();
      }, [clienteData, clienteRef]);
      
      return (
        <Container className="containerPagamentoCliente">
          <h2 className="h2title">Seus Pagamentos, {clienteInfo.username}</h2>
          {isLoading ? (
            <p>Carregando...</p>
          ) : (
            <div className="pagamentoCliente">
              {agendamentoInfo.map((agendamento, index) => {
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
      
                      {cartoesCliente.map((cartao, index) => (
                        <Row key={index} className="mb-3 pmts-transaction-info apx-transaction-date-container">
                          <Col md={3} style={{ color: "black" }}>
                            <strong style={{ color: "black" }}>Número do Cartão:</strong> {cartao.numero}
                          </Col>
                        </Row>
                      ))}
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
          <button className="buttonAg">
            <a href="/cliente/dados">Voltar</a>
          </button>
        </Container>
      );
      
}

export default ClientePagamentos;