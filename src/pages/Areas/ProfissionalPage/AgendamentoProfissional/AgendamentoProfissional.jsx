import { initializeApp } from "firebase/app";
import { EmailAuthCredential, getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
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

const ProfissionalAgendamentos = () => {
    const [agendamentoInfo, setAgendamentoInfo] = useState([]);
    const [profissionalInfo, setProfissionalInfo] = useState([]);
    const [id, setId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const history = useNavigate();

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const checkUserInProfissionalCollection = async (email) => {
        const userRef = collection(db, "profissional");
        const q = query(userRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    }

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
                const isProfissional = await checkUserInProfissionalCollection(user.email);

                if(!isProfissional){
                    history("/login");
                }else {
                    sessionStorage.setItem("role", "profissional");
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
        async function fetchProfissionalAgendamento() {
            try {
                setIsLoading(true);
                const auth = getAuth();
                const user = auth.currentUser;
                const uid = user ? user.uid : null;
    
                const agendamentoDoc = query(collection(db, "agendamento"), where("profissionalId", "==", uid));
                const querySnapshot = await getDocs(agendamentoDoc);
                const agendamentoInfo = [];
    
                for (const docSnapshot of querySnapshot.docs) {
                    const agendamentoData = docSnapshot.data();
    
                    const empresaId = agendamentoData.empresaId;
                    const clienteId = agendamentoData.clienteId;
                    const horarioId = agendamentoData.dataAgendamento;
                    const servicoId = agendamentoData.servicoId;
    
                    const [
                        empresaDocsSnapshot,
                        clienteDocsSnapshot,
                        horarioDocsSnapshot,
                        servicoDocsSnapshot,
                    ] = await Promise.all([
                        empresaId ? getDoc(doc(db, "empresa", empresaId)) : null,
                        clienteId ? getDoc(doc(db, "cliente", clienteId)) : null,
                        horarioId ? getDoc(doc(db, "horariosDisponiveis", horarioId)) : null,
                        servicoId ? getDoc(doc(db, "servico", servicoId)) : null,
                    ]);
    
                    const empresaData = empresaDocsSnapshot?.exists() ? empresaDocsSnapshot.data() : null;
                    const clienteData = clienteDocsSnapshot?.exists() ? clienteDocsSnapshot.data() : null;
                    const horarioData = horarioDocsSnapshot?.exists() ? horarioDocsSnapshot.data() : null;
                    const servicoData = servicoDocsSnapshot?.exists() ? servicoDocsSnapshot.data() : null;
    
                    agendamentoInfo.push({
                        id: docSnapshot.id,
                        ...agendamentoData,
                        empresa: empresaData,
                        cliente: clienteData,
                        servico: servicoData,
                        horario: horarioData,
                    });
                }
    
                setAgendamentoInfo(agendamentoInfo);
                setIsLoading(false);
            } catch (error) {
                console.error("Erro ao buscar informações: ", error);
                setIsLoading(false);
            }
        }
    
        fetchProfissionalAgendamento();
    }, [db]);
    

      useEffect(()=>{
        async function fetchProfissional(){
            try{
                setIsLoading(true);

                const auth = getAuth();
                const user = auth.currentUser;
                const uid = user ? user.uid : null;

                if(uid){
                    const profissionalDocRef = doc(db, "profissional", uid);

                    const docSnapshot = await getDoc(profissionalDocRef);

                    if(docSnapshot.exists()){
                        const data = docSnapshot.data();
                        setProfissionalInfo(data);
                    }
                    setIsLoading(false);
                }
            }catch(error) {
                console.error("Erro ao buscar informações: ", error);
                setIsLoading(false);
            }
        }
        fetchProfissional();
      }, []);

     return (
    <Container className="containerAgendamentoPro">
        <h2>Relatório de Agendamentos, {profissionalInfo.username}</h2>
        {isLoading ? (
            <p>Carregando...</p>
        ) : (
            <div className="agendamentoProfissional">
                {agendamentoInfo.length > 0 ? (
                    agendamentoInfo.map((agendamento) => (
                        <Card key={agendamento.id} className="agendamentosPro">
                            <Card.Body>
                            <Row>
                                {agendamento.servico && (
                                    <img src={agendamento.servico.img} alt={agendamento.servico.nome} className="imgAg2" />
                                )}
                                </Row>
                                <Row>
                                    {agendamento.empresa && (
                                        <Col md={3} className="rowAgendProfissional">
                                            <strong>Empresa: </strong>
                                            {agendamento.empresa.username}
                                        </Col>
                                    )}
                                </Row>
                                <Row>
                                    {agendamento.cliente && (
                                        <Col md={3} className="rowAgendProfissional">
                                            <strong>Cliente: </strong>
                                            {agendamento.cliente.username}
                                        </Col>
                                    )}
                                </Row>
                                <Row>
                                {agendamento.horario && (
                                    <Col md={3} className="rowAgendProfissional">
                                        <strong>Horário Selecionado: </strong>
                                        {agendamento.horario.horario.seconds && agendamento.horario.horario.nanoseconds
                                        ? new Date(agendamento.horario.horario.seconds * 1000).toLocaleString()
                                        : 'Horário não disponível'}
                                    </Col>
                                    )}
                                </Row>
                                <Row>
                                    {agendamento.servico && (
                                        <Col md={3} className="rowAgendProfissional">
                                            <strong>Serviço: </strong>
                                            {agendamento.servico.nome}
                                        </Col>
                                    )}
                                </Row>
                                <Row>
                                    {agendamento.servico && (
                                        <Col md={3} className="rowAgendProfissional">
                                            <strong>Valor: </strong>
                                            {agendamento.servico.valor}
                                        </Col>
                                    )}
                                </Row>
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <p>Nenhum agendamento encontrado.</p>
                )}
            </div>
        )}
        <Button><a href="/profissional/dados" className="buttonAgendPro">Voltar</a></Button>
    </Container>
);

}

export default ProfissionalAgendamentos;