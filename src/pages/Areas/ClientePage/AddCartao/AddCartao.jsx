import React, { useState, useEffect, useRef } from "react";
import { Form, Button,  Container, Table, Col, Row } from "react-bootstrap";
import { getDoc, collection, doc, addDoc, getFirestore, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";


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

const ClienteAddCartao = () => {
    const [cartoes, setCartao] = useState([]);
    const [id, setId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [clienteInfo, setClienteInfo] = useState([]);
    const [dataValidade, setDataValidade] = useState("");
    const [showAddService, setShowAddService] = useState(false);
    const history = useNavigate();

    const numeroRef = useRef(null);
    const nomRef = useRef(null);
    const dataValidadeRef = useRef(null);
    const codSegRef = useRef(null);
    const enderecoRef = useRef(null);

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
        async function fetchCliente() {
            try {
                setIsLoading(true);
    
                const auth = getAuth();
                const user = auth.currentUser;
                const uid = user ? user.uid : null;
    
                if (uid) {
                    const clienteRef = doc(db, "cliente", uid);
                    const cartoesQuerySnapshot = await getDocs(collection(clienteRef, "cartao"));
    
                    const cartoesData = cartoesQuerySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
    
                    setCartao(cartoesData);
    
                    const docSnapshot = await getDoc(clienteRef);
    
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        setClienteInfo(data);
                    }
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Erro ao buscar informações: ", error);
                setIsLoading(false);
            }
        }
        fetchCliente();
    }, []);
    

    useEffect(()=>{
        if(clienteInfo && clienteInfo.endereco){
            enderecoRef.current.value = clienteInfo.endereco;
        }
    }, [clienteInfo]);

    const handleCancelClick = () => {
        setShowAddService(false);
    }

    const handleCarataoSubmit = async () =>{
        const auth = getAuth();
        const user = auth.currentUser;
        const uid = user ? user.uid : null;

        if (uid) {
            const empresaDocRef = doc(db, "cliente", uid);
            const docSnapshot = await getDoc(empresaDocRef);
      
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              setClienteInfo(data);
            }

        const numero = numeroRef.current.value;
        const nome = nomRef.current.value;
        const codigo = codSegRef.current.value;
        const dataValidade = dataValidadeRef.current.value;

        try{
            const newCartao = {
                numero: numero,
                nome: nome,
                codigo: codigo,
                dataValidade: dataValidade,
                clienteId: uid
            }

            const configCartao = {
                method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newCartao),
            }

            const response =  await fetch("http://localhost:3000/addCartao", configCartao);

            if (!response.ok) {
                throw new Error("Erro na solicitação da API");
            }

            const responseData = await response.json();
            console.log('Resposta da API:', responseData);
            setSuccessMessage('Serviço cadastrado com sucesso!');
            setErrorMessage('');

            const clienteRef = doc(db, "cliente", uid);

            const docRef = await addDoc(collection(clienteRef, "cartao"), newCartao);

            setCartao([...cartoes, {id: docRef.id, ...newCartao}]);

            setSuccessMessage("Cartão cadastrado com sucesso!");
            setErrorMessage("");

            numeroRef.current.value = "";
            nomRef.current.value = "";
            codSegRef.current.value = "";
            dataValidadeRef.current.value = "";
        } catch (error) {
            console.error("Erro ao adicionar cartão", error);
            setErrorMessage("Erro ao adicionar cartão: " + error.message);
        }
    }
    }


    return(
        <Container className="centeredFormCartaoCli">
            <h2 style={{color: "black"}}>Informações do Cartão:</h2>
           {successMessage && <div className="successMessage">{successMessage}</div>}
          {errorMessage && <div className="errorMessage">{errorMessage}</div>}

          <Form> 
            <Row className="cartaoRowCli">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Código do Cartão:</Form.Label>
                    </Form.Group>
                </Col>
                <Col md={9} className="cartaoColCli">
                    <Form.Group>
                        <Form.Control
                        type="number"
                        ref={codSegRef}
                        required
                        style={{width: "400px", height: "30px"}}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row className="cartaoRowCli">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Nome Titular:</Form.Label>
                    </Form.Group>
                </Col>
                <Col md={9} className="cartaoColCli">
                    <Form.Group>
                        <Form.Control
                        type="text"
                        ref={nomRef}
                        required
                        style={{width: "400px", height: "30px"}}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row className="cartaoRowCli">
                <Col md={3}>
                    <Form.Group as={Col} controlId="formGridDataValidade">
                        <Form.Label>Data de Validade:</Form.Label>
                    </Form.Group>
                </Col>
                <Col md={9} className="cartaoColCli">
                    <Form.Group>
                        <Form.Control
                        type="date"
                        placeholder="Data de Validade"
                        ref={dataValidadeRef}
                        onChange={(e) => setDataValidade(e.target.value)}
                        value={dataValidade}
                        required
                        style={{width: "400px", height: "30px"}}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row className="cartaoRowCli">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Número do Cartão:</Form.Label>
                    </Form.Group>
                </Col>
                <Col md={9} className="cartaoColCli">
                    <Form.Group>
                        <Form.Control
                        type="number"
                        ref={numeroRef}
                        required
                        style={{width: "400px", height: "30px"}}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row className="cartaoRowCli">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Endereço:</Form.Label>
                    </Form.Group>
                </Col>
                <Col md={9} className="cartaoColCli">
                    <Form.Group>
                        <Form.Control
                        type="text"
                        ref={enderecoRef}
                        value={clienteInfo.endereco || ""}
                        required
                        readOnly
                        style={{width: "400px", height: "30px"}}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "10px"}} >
                <Button variant="primary" onClick={handleCarataoSubmit} className="buttonCartaoCli">
                Adicionar
                </Button>
                <Button onClick={handleCancelClick} className="buttonCartaoCli"><NavLink to="/cliente">Cancelar</NavLink></Button>
            </div>
          </Form>
        </Container>
    )
}

export default ClienteAddCartao;