import { initializeApp } from "firebase/app";
import { EmailAuthProvider, getAuth } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, setDoc, query , where, getDoc, deleteDoc} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col, Card, Button } from  "react-bootstrap";
import { useNavigate } from "react-router-dom";
import './css/EmpresaPg.css';
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'

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

const EmpresaDashboard = () => {
    const [editMode, setEditMode] = useState(false);
    const [empresaInfo, setEmpresaInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [ id, setId] = useState(null);
    const [newEmail, setNewEmail] = useState('');
    const history = useNavigate();

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const checkUserInEmpresaCollection = async (email) => {
        const db = getFirestore();
        const userRef = collection(db, "empresa");
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
      }

    useEffect(()=>{
        checkUserRole();
    }, [history]);

    const handleEditClick = () => {
        setEditMode(true);
    }

    const handleChangeEmail = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        const uid = user ? user.uid : null;
    
        if (user) {
         
          const credential = EmailAuthProvider.credential(user.email);
    
          try {
            await reauthenticateWithCredential(user, credential);
    
            // Reautenticação bem-sucedida, agora você pode atualizar o email
            await updateEmail(user, newEmail);
    
            // Atualize a coleção "users" com o novo email
            const userRef = doc(db, 'profissional', user.uid);
            await setDoc(userRef, { email: newEmail }, { merge: true });
    
            // Limpe o campo de email
            setNewEmail('');
    
            // O email foi atualizado com sucesso
            console.log('Email atualizado com sucesso.');
          } catch (error) {
            console.error('Erro ao atualizar o email:', error);
          }
        }
      };

      const handleSaveClick = async () => {
        try {
            const empresaDocRef = doc(db, "empresa", id);
            await setDoc(empresaDocRef, empresaInfo, { merge: true });
    
            const configEmpresa = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            };
    
            const response = await fetch(`http://localhost:3000/empresa/${id}`, configEmpresa);
    
            if (!response.ok) {
                throw new Error("Erro na solicitação da API");
            }
    
            setSuccessMessage('Dados encontrados com sucesso!');
            setErrorMessage('');
            setEditMode(false);
        } catch (error) {
            console.error("Erro ao salvar informações", error);
            setErrorMessage('Erro ao salvar informações: ' + error.message);
        }
        setEditMode(false);
    };
    

    const handleCancelClick = () => {
        setEditMode(false);
    }

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

    const handleDelete = async () => {
        try{

            const confirmDelete = window.confirm("Tem certeza que deseja excluir conta?");
            if(confirmDelete){
                const empresaDocRef = doc(db, "empresa", id);

                const deleteConfig = {
                    method: 'DELETE',
                    headers: {
                        'Content-type': 'application/json'
                       },
                  };
        
                  const response = await fetch(`http://localhost:3000/empresa/remove/1/${id}`, deleteConfig);

                  if(!response.ok){
                    throw new Error("Erro na solicitação da API");
                  }

                  const responseData = await response.json();
                  console.log('Resposta da API:', responseData);
                  setSuccessMessage('Conta excluída com sucesso!');
                  setErrorMessage('');
                 
                  await deleteDoc(empresaDocRef);

                  history("/login");

            }
        }catch (error) {
            console.error("Erro ao excluir conta", error);
            setErrorMessage('Erro ao excluir conta: ' + error.message);
          }
    }


    return(
        <Container className="centerdFormProfileEmp">
            {isLoading ? (
                <p>Carregando Informações...</p>
            ) : editMode ? (
                <Form>
                    <h2>Minhas Informações:</h2>
                    <Row className="rowProfileEmp">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label style={{color: "black"}}>Nome da Empresa: </Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9} className="text-secundary">
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={empresaInfo.username}
                                onChange={(e) =>
                                    setEmpresaInfo({ ...empresaInfo, username: e.target.value })
                                }
                                style={{width: "400px", height: "30px"}}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="rowProfileEmp">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label style={{color: "black"}}>Email: </Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9} className="text-secundary">
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={empresaInfo.email}
                                onChange={(e) => setNewEmail(e.target.value)}
                                style={{width: "400px", height: "30px"}}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="rowProfileEmp">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label style={{color: "black"}}>CNPJ:</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9} className="text-secundary">
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={empresaInfo.cnpj}
                                onChange={(e)=> setEmpresaInfo({...empresaInfo, cnpj: e.target.value})}
                                style={{width: "400px", height: "30px"}}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="rowProfileEmp">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label style={{color: "black"}}>Descrição:
                                </Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9} className="text-secundary">
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={empresaInfo.descricao}
                                onChange={(e)=> setEmpresaInfo({...empresaInfo, descricao: e.target.value})}
                                style={{width: "400px", height: "30px"}}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="rowProfileEmp">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label style={{color: "black"}}>Telefone:</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9} className="text-secundary">
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={empresaInfo.telefone}
                                onChange={(e)=> setEmpresaInfo({...empresaInfo, telefone: e.target.value})}
                                style={{width: "400px", height: "30px"}}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="rowProfileEmp">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label style={{color: "black"}}>Endereço:</Form.Label>
                            </Form.Group>
                        </Col>
                        <Col md={9}>
                            <Form.Group>
                                <Form.Control
                                type="text"
                                value={empresaInfo.endereco}
                                onChange={(e)=> setEmpresaInfo({...empresaInfo, endereco: e.target.value})}
                                style={{width: "400px", height: "30px"}}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "10px"}}>
                    <Button onClick={handleSaveClick} className="infoButtonEmp">Salvar</Button>
                    <Button onClick={handleCancelClick} className="infoButtonEmp">Cancelar</Button>
                    </div>
                </Form>
            ) : (
                <Card>
                    <Card.Body className="infoProfileEmp">
                        <Row>
                            <Col md={12}>
                                <Card>
                                    <Card.Body>
                                        <Row >
                                            <Col md={3}>
                                                <strong>Nome da Empresa:</strong>
                                            </Col>
                                            <Col md={9} className="text-secundary">{empresaInfo.username}</Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <Col md={3}>
                                                <strong>Email:</strong>
                                            </Col>
                                            <Col md={9} className="text-secundary">{empresaInfo.email}</Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <Col md={3}>
                                                <strong>CNPJ:</strong>
                                            </Col>
                                            <Col md={9} className="text-secundary">{empresaInfo.cnpj}</Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <Col md={3}>
                                                <strong>Descrição:</strong>
                                            </Col>
                                            <Col md={9} className="text-secundary">{empresaInfo.descricao}</Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <Col md={3}>
                                                <strong>Telefone:</strong>
                                            </Col>
                                            <Col md={9} className="text-secundary">{empresaInfo.telefone}</Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <Col md={3}>
                                                <strong>Endreço:</strong>
                                            </Col>
                                            <Col md={9} className="text-secundary">{empresaInfo.endereco}</Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Button className="infoButtonProfileEmp" onClick={handleEditClick}>Editar</Button>
                        <Button className="infoButtonProfileEmp" onClick={handleDelete}>Excluir Conta</Button>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
}

export default EmpresaDashboard;