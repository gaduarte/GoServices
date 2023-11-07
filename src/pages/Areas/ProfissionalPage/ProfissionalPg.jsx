import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, setDoc, query , where, getDoc} from "firebase/firestore";
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

            const response = await fetch(`http://localhost:3000/profissional/1/${id}`);

            if(!response.ok){
                throw new Error("Erro na solicitação da API");
            }
            const data = await response.json();
            setEmpresaInfo(data);
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


return(
        <Container>
            {isLoading ? (
                <p>Carregando Informações...</p>
            ) : editMode ? (
                <Form>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Nome da Pessoa Prestadora de Serviço:</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9} className="text-secundary">
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={profissionalInfo.username}
                                onChange={(e)=> setProfissionalInfo({...profissionalInfo, username: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Email: </Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9} className="text-secundary">
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={profissionalInfo.email}
                                onChange={(e)=> setProfissionalInfo({...profissionalInfo, email: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>CPF:</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9} className="text-secundary">
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={profissionalInfo.cpf}
                                onChange={(e)=> setProfissionalInfo({...profissionalInfo, cpf: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Tipo de Serviço:</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9} className="text-secundary">
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={profissionalInfo.tipoServico}
                                onChange={(e)=> setProfissionalInfo({...profissionalInfo, tipoServico: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Telefone:</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9} className="text-secundary">
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={profissionalInfo.telefone}
                                onChange={(e)=> setProfissionalInfo({...profissionalInfo, telefone: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Endereço:</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9}>
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={profissionalInfo.endereco}
                                onChange={(e)=> setProfissionalInfo({...profissionalInfo, endereco: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button onClick={handleSaveClick}>Salvar</Button>
                    <Button onClick={handleCancelClick} >Cancelar</Button>
                </Form>
            ) : (
                <Card>
                    <Card.Body>
                        <Row>
                            <Col md={12}>
                                <Card>
                                    <Card.Body>
                                        <Row>
                                            <Col md={3}>
                                                <strong>Nome do Profissional:</strong>
                                            </Col>
                                            <Col md={9} className="text-secundary">{profissionalInfo.username}</Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <Col md={3}>
                                                <strong>Email:</strong>
                                            </Col>
                                            <Col md={9} className="text-secundary">{profissionalInfo.email}</Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <Col md={3}>
                                            <strong>CPF:</strong>
                                            </Col>
                                            <Col md={9} className="text-secondary">
                                            {profissionalInfo.cpf}
                                            </Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <Col md={3}>
                                            <strong>Tipo de Serviço</strong>
                                            </Col>
                                            <Col md={9} className="text-secondary">
                                            {profissionalInfo.tipoServico}
                                            </Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <Col md={3}>
                                                <strong>Telefone:</strong>
                                            </Col>
                                            <Col md={9} className="text-secundary">{profissionalInfo.telefone}</Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <Col md={3}>
                                                <strong>Endreço:</strong>
                                            </Col>
                                            <Col md={9} className="text-secundary">{profissionalInfo.endereco}</Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Button onClick={handleEditClick}>Editar</Button>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
    
}

export default ProfissionalDashboard;