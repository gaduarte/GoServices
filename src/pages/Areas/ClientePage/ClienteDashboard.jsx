import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col, Card, Button } from  "react-bootstrap";
import { useNavigate } from "react-router-dom";
import './css/ClientePg.css';

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

const ClienteDashboard = () => {
    const [editMode, setEditMode] =  useState(false);
    const [clientInfo, setClientInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [id, setId] = useState(null);
    const history = useNavigate();

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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

    const handleEditClick = () => {
        setEditMode(true);
    }

    const handleSaveClick = async () =>{
        try {
            const clienteDocRef = doc(db, "cliente", id);
    
            await setDoc(clienteDocRef, clientInfo, { merge: true });
    
            const response = await fetch(`http://localhost:3000/cliente/1/${id}`);
    
            if (!response.ok) {
                throw new Error("Erro na solicitação da API");
            }
    
            const data = await response.json();
            setClientInfo(data); 
            setSuccessMessage('Dados encontrados com sucesso!');
            setErrorMessage('');
            setEditMode(false);
        } catch (error) {
            console.error("Erro ao salvar informações", error);
            setErrorMessage('Erro ao salvar informações: ' + error.message);
        }
        setEditMode(false);
    }

    const handleCancelClick = () => {
        setEditMode(false);
    }

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
                        setClientInfo(data);
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

    return (
        <Container className="centeredFormProfileCli">
          <h2>Suas Informações:</h2>
      {isLoading ? (
        <p>Carregando informações...</p>
      ) : editMode ? (
        <Form className="formProfileCli">
          <Row className="rowProfileCli">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{color: "black"}}>Nome de usuário:</Form.Label>
              </Form.Group>
            </Col>
            <Col md={9} className="text-secondary" >
              <Form.Group>
                <Form.Control
                  type="text"
                  value={clientInfo.username}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, username: e.target.value })
                  }
                  style={{width: "380px",  height: "30px"}}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="rowProfileCli">
            <Col md={3}>
              <Form.Group>
                <Form.Label  style={{color: "black"}}>Email:</Form.Label>
              </Form.Group>
            </Col>
            <Col md={9} className="text-secondary">
              <Form.Group>
                <Form.Control
                  type="text"
                  value={clientInfo.email}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, email: e.target.value })
                  }
                  style={{width: "380px",  height: "30px"}}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="rowProfileCli">
            <Col md={3}>
              <Form.Group>
                <Form.Label  style={{color: "black"}}>Telefone:</Form.Label>
              </Form.Group>
            </Col>
            <Col md={9} className="text-secondary">
              <Form.Group>
                <Form.Control
                  type="text"
                  value={clientInfo.telefone}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, telefone: e.target.value })
                  }
                  style={{width: "380px",  height: "30px"}}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="rowProfileCli">
            <Col md={3}>
              <Form.Group>
                <Form.Label  style={{color: "black"}}>CPF:</Form.Label>
              </Form.Group>
            </Col>
            <Col md={9} className="text-secondary">
              <Form.Group>
                <Form.Control
                  type="text"
                  value={clientInfo.cpf}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, cpf: e.target.value })
                  }
                  style={{width: "380px", height: "30px"}}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="rowProfileCli">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{color: "black"}}>Endereço:</Form.Label>
              </Form.Group>
            </Col>
            <Col md={9} className="text-secondary">
              <Form.Group>
                <Form.Control
                  type="text"
                  value={clientInfo.endereco}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, endereco: e.target.value })
                  }
                  style={{width: "380px", height: "30px"}}
                />
              </Form.Group>
            </Col>
          </Row>
          <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "10px"}}>
            <Button onClick={handleSaveClick}className="buttonProfileCli">Salvar</Button>
            <Button onClick={handleCancelClick} className="buttonProfileCli">Cancelar</Button>
          </div>
        </Form>
      ) : (
        <Card>
          <Card.Body>
          <Row>
        <Col md={12}>
          <Card>
            <Card.Body className="infoProfileCli">
              <Row>
                <Col md={3}>
                  <strong>Nome de usuário:</strong>
                </Col>
                <Col md={9} className="text-secondary">
                  {clientInfo.username}
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={3}>
                  <strong>Email:</strong>
                </Col>
                <Col md={9} className="text-secondary">
                  {clientInfo.email}
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={3}>
                  <strong>Telefone:</strong>
                </Col>
                <Col md={9} className="text-secondary">
                  {clientInfo.telefone}
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={3}>
                  <strong>CPF:</strong>
                </Col>
                <Col md={9} className="text-secondary">
                  {clientInfo.cpf}
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={3}>
                    <strong>Endereço: </strong>
                </Col>
                <Col md={9}
                className="text-secondary">
                    {clientInfo.endereco}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
            <Button className="infoButtonProfileCli" onClick={handleEditClick}>
              Editar
            </Button>

          </Card.Body>
        </Card>
      )}
    </Container>
      );
}

export default ClienteDashboard;