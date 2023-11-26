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

const EmpresaAgendamentos = () => {
    const [agendamentoInfo, setAgendamentoInfo] = useState([]);
    const [empresaInfo, setEmpresaInfo] = useState([]);
    const [id, setId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const history = useNavigate();

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const checkUserInEmpresaCollection = async (email) => {
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
        try{
            const auth = getAuth();
            const user = auth.currentUser;

            if(!user){
                history("/login");
            }else{
                const isEmpresa = await checkUserInEmpresaCollection(user.email);

                if(!isEmpresa){
                    history("/login");
                }else{
                    sessionStorage.setItem("role", "empresa");
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

      useEffect(()=> {
        async function fetchEmpresaAgendamento(){
            try{
                setIsLoading(true);
                const auth = getAuth();
                const user = auth.currentUser;
                const uid = user ? user.uid : null;

                const agendamentoDoc = query(collection(db, "agendamento"), where("empresaId", "==", uid));
                const querySnapshot = await getDocs(agendamentoDoc);
                const agendamentoInfo = [];

                for(const docSnapshot of querySnapshot.docs){
                    const agendamentoData = docSnapshot.data();

                    const clienteId = agendamentoData.clienteId;
                    const clienteDocRef = doc(db, "cliente", clienteId);
                    const clienteDocsSnapshot = await getDoc(clienteDocRef);


                    const horarioId = agendamentoData.dataAgendamento;
                    const horarioDocRef = doc(db, "horariosDisponiveis", horarioId);
                    const horarioDocsSnapshot = await getDoc(horarioDocRef);


                    const profissionalId = agendamentoData.profissionalId;
                    const profissionalDocRef = doc(db, "profissional", profissionalId);
                    const profissionalDocsSnapshot = await getDoc(profissionalDocRef);

                    const servicoId = agendamentoData.servicoId;
                    const servicoDocRef = doc(db, "servico", servicoId);
                    const servicoDocsSnapshot = await getDoc(servicoDocRef);

                    const [servicoData, clienteData, horarioData, profissionaisData] = await Promise.all([
                        servicoDocsSnapshot.exists() ? 
                        servicoDocsSnapshot.data() : null,
                        clienteDocsSnapshot.exists() ? 
                        clienteDocsSnapshot.data() : null,
                        getDoc(horarioDocRef).then(snapshot => snapshot.exists() ? snapshot.data() : null),
                        getDoc(profissionalDocRef).then(snapshot => snapshot.exists() ? snapshot.data() : null),
                    ])

                        agendamentoInfo.push({
                            id: docSnapshot.id,
                            ...agendamentoData,
                            servico: servicoData,
                            cliente: clienteData,
                            horario: horarioData,
                            profissional: profissionaisData,
                        });


                }
                setAgendamentoInfo(agendamentoInfo);
                setIsLoading(false);
            }catch (error) {
                console.error("Erro ao buscar informações: ", error);
                setIsLoading(false);
        }
    }
    fetchEmpresaAgendamento();
      }, [db]);

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
                }catch(error) {
                    console.error("Erro ao buscar informações: ", error);
                    setIsLoading(false);
                }
        }
        fetchEmpresa();
      }, []);

      return (
        <Container>
            <h2 style={{fontSize: "40px"}}>Relatório de Agendamentos, {empresaInfo.username}</h2>
            {isLoading ? (
                <p>Carregando...</p>
            ) : (
                <div className="historicoEmp">
                    {agendamentoInfo.length > 0 ? (
                        agendamentoInfo.map((agendamento) => (
                            <Card key={agendamento.id} className="mb-3">
                                <Card.Body>
                                <Row>
                                {agendamento.servico && (
                                    <img src={agendamento.servico.img} alt={agendamento.servico.nome} className="imgAg2" />
                                )}
                                </Row>
                                    <Row style={{color: "Black"}}>
                                        {agendamento.cliente && (
                                            <Col md={3} className="rowHistoricoEmp">
                                                <strong>Cliente que Agendou: </strong>
                                                {agendamento.cliente.username}
                                            </Col>
                                        )}
                                    </Row>
                                    <Row style={{color: "Black"}}>
                                        {agendamento.horario && (
                                            <Col md={3} className="rowHistoricoEmp">
                                                <strong>Horário de Agendamento: </strong>
                                                {agendamento.horario.horario}
                                            </Col>
                                        )}
                                    </Row>
                                    <Row style={{color: "Black"}}>
                                        {agendamento.profissional && (
                                            <Col md={3} className="rowHistoricoEmp">
                                                <strong>Pessoa Prestadora de Serviço:</strong>
                                                {agendamento.profissional.username}
                                            </Col>
                                        )}
                                    </Row>
                                    <Row style={{color: "Black"}}>
                                        {agendamento.servico && (
                                            <Col md={3} className="rowHistoricoEmp">
                                                <strong>Serviço Agendado: </strong>
                                                {agendamento.servico.nome}
                                            </Col>
                                        )}
                                    </Row>
                                    <Row style={{color: "Black"}}>
                                        {agendamento.servico && (
                                            <Col md={3} className="rowHistoricoEmp">
                                                <strong>Valor do Serviço: </strong>
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
            <Button className="buttonHistoricoEmp"><a href="/empresa">Voltar</a></Button>
        </Container>
    );

}

export default EmpresaAgendamentos;