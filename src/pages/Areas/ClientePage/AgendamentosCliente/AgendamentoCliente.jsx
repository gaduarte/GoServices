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

const ClienteAgendamentos = () => {
    const [id, setId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [clienteInfo, setClienteInfo] = useState([]);
    const [servicoData, setServicoData] = useState([]);
    const [agendamentoInfo, setAgendamentoInfo] = useState([]);
    const [slectedHorario, setSelectedHorario] = useState(null);
    const [horarios, setHorarios] = useState([]);
    const [agendamentoId, setagendamentoId] = useState(null);
    const history = useNavigate();

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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
    


    useEffect(()=>{
        async function fetchCliente(){
            try{
                setIsLoading(true);

                const auth = getAuth();
                const user = auth.currentUser;
                const uid = user ? user.uid : null;

                if(uid){
                    const clienteDocRef = doc(db, "cliente", uid);

                    const docSnapshot = await getDoc(clienteDocRef);

                    if(docSnapshot.exists()){
                        const data = docSnapshot.data();
                        setClienteInfo(data);
                    }
                    setIsLoading(false);
                }
                }catch(error) {
                    console.error("Erro ao buscar informações: ", error);
                    setIsLoading(false);
                }
        }
        fetchCliente();
    }, []);
   
    const handleDeleteAgendamento = async (event, agendamentoId) => {
        try {
          event.preventDefault();
      
          const confirmCancel = window.confirm("Tem certeza de que deseja cancelar este agendamento?");
          if (!confirmCancel) {
            return;
          }
      
          setIsLoading(true);
      
          const auth = getAuth();
          const user = auth.currentUser;
          const uid = user ? user.uid : null;
      
          if (!uid) {
            throw new Error("Usuário não autenticado.");
          }
      
          const agendamentoRef = doc(db, "agendamento", agendamentoId);
          const agendamentoDoc = await getDoc(agendamentoRef);
      
          console.log("Agendamento: ", agendamentoId);
      
          if (!agendamentoDoc.exists()) {
            console.log("Agendamento não encontrado.");
            return;
          }
      
          const horarioId = agendamentoDoc.data().dataAgendamento;
      
          const horarioDocRef = doc(db, "horariosDisponiveis", horarioId);
          const horarioDoc = await getDoc(horarioDocRef);
      
          if (!horarioDoc.exists()) {
            console.log("Horário não encontrado na coleção horariosDisponiveis.");
            return;
          }
      
          const dataAgendamento = horarioDoc.data().horario; 
      
          if (dataAgendamento) {
            const currentDate = new Date();
            const formattedCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
            const formattedDataAgendamento = new Date(dataAgendamento.seconds * 1000);
      
            console.log("Current Date:", formattedCurrentDate);
            console.log("Data Agendamento:", formattedDataAgendamento);
      
            if (isNaN(formattedDataAgendamento.getTime())) {
              console.error("Data Agendamento inválida:", dataAgendamento);
            }
      
            if (formattedDataAgendamento > formattedCurrentDate) {
              const deleteConfig = {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json; charset=UTF-8",
                },
              };
      
              console.log("Enviando solicitação de exclusão...");
      
              const response = await fetch(`http://localhost:3000/agendamento/remove/${agendamentoId}`, deleteConfig);
      
              console.log("Resposta da API:", response);
      
              if (!response.ok) {
                throw new Error("Erro na solicitação da API");
              }
      
              await deleteDoc(agendamentoRef);
      
              // Atualiza o status no Firestore para horarioAgendado: false
              await updateDoc(horarioDocRef, { status: false });

               // Atualiza o estado local para refletir a exclusão
              setAgendamentoInfo((prevAgendamentoInfo) => prevAgendamentoInfo.filter(item => item.id !== agendamentoId));
      
              console.log("Agendamento cancelado com sucesso!");
            } else {
              console.log("Não é possível cancelar agendamento com data passada.");
            }
          } else {
            console.log(`O campo de data do agendamento não contém um valor válido.`);
          }
        } catch (error) {
          console.error("Erro ao excluir agendamento", error);
          setErrorMessage('Erro ao excluir agendamento: ' + error.message);
        } finally {
          setIsLoading(false);
        }
      };
      
      
        
    return (
       <Container className="containerAgendamentoCliente">
        <h2>Seus Agendamentos, {clienteInfo.username}</h2>
        {isLoading ? (
            <p>Carregando...</p>
        ) : (
            <div className="agendamentoCliente">
                {agendamentoInfo.map((agendamento)=>(
                    <Card key={agendamento.id} className="mb-3">
                        <Card.Body className="cardColor">
                        <Row >
                                {agendamento.servico && (
                                    <img src={agendamento.servico.img} alt={agendamento.servico.nome} className="imgAg1" />
                                )}
                            </Row>
                            <Row style={{color: "Black"}}>
                                {agendamento.horario && (
                                    <Col md={3} className="rowAgendCliente">
                                        <strong>Data Agendamento: </strong>
                                        {new Date(agendamento.horario.horario.seconds * 1000).toLocaleString()}
                                    </Col>
                                )}
                            </Row>

                        <Row style={{color: "Black"}}>
                            {agendamento.servico && (
                                <Col md={3} className="rowAgendCliente">
                                    <strong>Serviço: </strong>{agendamento.servico.nome}
                                   
                                </Col>
                            )}
                            </Row>
                            <Row style={{color: "Black"}}>
                                {agendamento.empresa && (
                                    <Col md={3} className="rowAgendCliente">
                                        <strong>Empresa: </strong>
                                        {agendamento.empresa.username}
                                       
                                    </Col>
                                )}
                            </Row>
                            <Row style={{color: "Black"}}>
                                {agendamento.profissional && (
                                    <Col md={3} className="rowAgendCliente">
                                       <strong>Profissional: </strong> {agendamento.profissional.username}
                                      
                                    </Col>
                                )}
                            </Row>
                            <Row style={{color: "Black"}} >
                                {agendamento.servico && (
                                     <Col md={3} className="rowAgendCliente">
                                     <strong>Valor: </strong>{agendamento.servico && agendamento.servico.valor}
                                    
                                    </Col>
                                )}
                            </Row>
                            <Button onClick={(e) => handleDeleteAgendamento(e, agendamento.id)}>Cancelar</Button>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        )}
        <button className="buttonAg"><a href="/cliente/dados">Voltar</a></button>
       </Container>
    )
}
export default ClienteAgendamentos;