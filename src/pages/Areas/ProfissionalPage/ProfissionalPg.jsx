import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, setDoc, query , where, getDoc, deleteDoc} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col, Card, Button } from  "react-bootstrap";
import { useNavigate } from "react-router-dom";
import './css/ProfissionalPg.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faCreditCard,
  faIdCard,
  faPhone,
  faMapMarker,
} from "@fortawesome/free-solid-svg-icons";

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

const ProfissionalDashboard = () => {
    const [editMode, setEditMode] = useState(false);
    const [profissionalInfo, setProfissionalInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const[id, setId] = useState(null);
    const history = useNavigate();

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const checkUserInProfissionalCollection = async (email) => {
        const db = getFirestore();
        const userRef = collection(db, "profissional");
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
        try{
            const auth = getAuth();
            const user = auth.currentUser;

            if(!user){
                history("/login");
            }else{
                const isProfissional = await checkUserInProfissionalCollection(user.email);

                if(!isProfissional){
                    history("/login");
                }else{
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

    const handleEditClick = () => {
        setEditMode(true);
    }

    const handleSaveClick = async()=>{
        try{
            const profissionalDocRef = doc(db, "profissional", id);
            await setDoc(profissionalDocRef, profissionalInfo, {merge: true});

            const configProfissional = {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
              },
            }

            const response = await fetch(`http://localhost:3000/profissional/${id}`, configProfissional);

            if(!response.ok){
                throw new Error("Erro na solicitação da API");
            }
            const data = await response.json();
            setSuccessMessage('Dados encontrados com sucesso!');
            setErrorMessage('');
            setEditMode(false);
        }catch(error){
            console.error("Erro ao salvar informações", error);
            setErrorMessage('Erro ao salvar informações: ' + error.message);
        }
        setEditMode(false);
    }

    const handleCancelClick = () => {
        setEditMode(false);
    }

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

            }catch(error){
                console.error("Erro ao buscar informações: ", error);
                setIsLoading(false);
            }
        }
       fetchProfissional();
    }, []);

    const handleDeleteClick = async() =>{
        try{
            setIsLoading(true);

            const auth = getAuth();
            const user = auth.currentUser;
            const uid = user ? user.uid : null;

            if (!uid) {
            throw new Error("Usuário não autenticado.");
            }

            const confirmDelete = window.confirm("Tem certeza que deseja excluir conta?");
            if(confirmDelete){
                const profissionalDocRef = doc(db, "profissional", id);

                const agendamentoRef = collection(db, "agendamento");
                const q = query(agendamentoRef, where("profissionalId", "==", uid));
                const agendamentoQuerySnapshot = await getDocs(q);
                const agendamentosAssociados = agendamentoQuerySnapshot.docs.length > 0;

                if (agendamentosAssociados) {
                    const errorMessage = 'Não é possível excluir profissional que está relacionada a um agendamento';
                    setErrorMessage(errorMessage);
                    throw new Error("Existem agendamentos associados a este profissional. Não é possível excluí-lo.");
                }

                const deleteConfig = {
                    method: "DELETE",
                    headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    },
                }

                const response = await fetch(`http://localhost:3000/profissional/remove/1/${id}`, deleteConfig);

                if(!response.ok){
                    throw new Error("Erro na solicitação da API");
                  }
            
                  setSuccessMessage("Conta excluída com sucesso!");
                  setErrorMessage('');
                  await deleteDoc(profissionalDocRef);
                  history("/cadastro");
            }
        }catch (error) {
            console.error("Erro ao excluir conta", error);
            setErrorMessage('Erro ao excluir conta: ' + error.message);
          }
    }

    return (
        <Container className="centeredFormProfilePro">
          {successMessage && <div className="successMessageCli">{successMessage}</div>}
          {errorMessage && <div className="errorMessageCli">{errorMessage}</div>}
          {editMode ? (
            <Form>
              <Row className="rowProfilePro">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Nome da Pessoa Prestadora de Serviço:</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secundary">
                  <Form.Group>
                    <Form.Control
                      type="text"
                      value={profissionalInfo.username}
                      onChange={(e) => setProfissionalInfo({ ...profissionalInfo, username: e.target.value })}
                      style={{ width: "400px", height: "30px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="rowProfilePro">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Email: </Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secundary">
                  <Form.Group>
                    <Form.Control
                      type="text"
                      value={profissionalInfo.email}
                      onChange={(e) => setProfissionalInfo({ ...profissionalInfo, email: e.target.value })}
                      style={{ width: "400px", height: "30px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="rowProfilePro">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>CPF:</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secundary">
                  <Form.Group>
                    <Form.Control
                      type="text"
                      value={profissionalInfo.cpf}
                      onChange={(e) => setProfissionalInfo({ ...profissionalInfo, cpf: e.target.value })}
                      style={{ width: "400px", height: "30px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="rowProfilePro">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Tipo de Serviço:</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secundary">
                  <Form.Group>
                    <Form.Control
                      type="text"
                      value={profissionalInfo.tipoServico}
                      onChange={(e) => setProfissionalInfo({ ...profissionalInfo, tipoServico: e.target.value })}
                      style={{ width: "400px", height: "30px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="rowProfilePro">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Telefone:</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secundary">
                  <Form.Group>
                    <Form.Control
                      type="text"
                      value={profissionalInfo.telefone}
                      onChange={(e) => setProfissionalInfo({ ...profissionalInfo, telefone: e.target.value })}
                      style={{ width: "400px", height: "30px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="rowProfilePro">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Endereço:</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9}>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      value={profissionalInfo.endereco}
                      onChange={(e) => setProfissionalInfo({ ...profissionalInfo, endereco: e.target.value })}
                      style={{ width: "400px", height: "30px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "10px" }}>
                <Button onClick={handleSaveClick} className="infoButtonPro">
                  Salvar
                </Button>
                <Button onClick={handleCancelClick} className="infoButtonPro">
                  Cancelar
                </Button>
              </div>
            </Form>
          ) : (
            <Card>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <Card>
                      <Card.Body className="infoProfilePro">
                        <Row className="rowProInfo">
                          <Col md={3}>
                            <div className="iconDiv">
                              <FontAwesomeIcon icon={faUserCircle} />
                            </div>
                            <strong>Nome do Profissional:</strong>
                          </Col>
                          <Col md={9} className="text-secundary">
                            {profissionalInfo.username}
                          </Col>
                        </Row>
                        <hr />
                        <Row className="rowProInfo">
                          <Col md={3}>
                            <div className="iconDiv">
                              <FontAwesomeIcon icon={faCreditCard} />
                            </div>
                            <strong>Email:</strong>
                          </Col>
                          <Col md={9} className="text-secundary">
                            {profissionalInfo.email}
                          </Col>
                        </Row>
                        <hr />
                        <Row className="rowProInfo">
                          <Col md={3}>
                            <div className="iconDiv">
                              <FontAwesomeIcon icon={faIdCard} />
                            </div>
                            <strong>CPF:</strong>
                          </Col>
                          <Col md={9} className="text-secondary">
                            {profissionalInfo.cpf}
                          </Col>
                        </Row>
                        <hr />
                        <Row className="rowProInfo">
                          <Col md={3}>
                            <div className="iconDiv">
                              <FontAwesomeIcon icon={faCreditCard} />
                            </div>
                            <strong>Tipo de Serviço</strong>
                          </Col>
                          <Col md={9} className="text-secondary">
                            {profissionalInfo.tipoServico}
                          </Col>
                        </Row>
                        <hr />
                        <Row className="rowProInfo">
                          <Col md={3}>
                            <div className="iconDiv">
                              <FontAwesomeIcon icon={faPhone} />
                            </div>
                            <strong>Telefone:</strong>
                          </Col>
                          <Col md={9} className="text-secundary">
                            {profissionalInfo.telefone}
                          </Col>
                        </Row>
                        <hr />
                        <Row className="rowProInfo">
                          <Col md={3}>
                            <div className="iconDiv">
                              <FontAwesomeIcon icon={faMapMarker} />
                            </div>
                            <strong>Endereço:</strong>
                          </Col>
                          <Col md={9} className="text-secundary">
                            {profissionalInfo.endereco}
                          </Col>
                        </Row>
                      </Card.Body>
                      <div className="buttonContainer">
                          <Button onClick={handleEditClick} className="infoButtonProfilePro">
                            Editar
                          </Button>
                          <Button className="infoButtonProfilePro" onClick={handleDeleteClick}>
                            Excluir Conta
                          </Button>
                        </div>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Container>
      );
    
}

export default ProfissionalDashboard;