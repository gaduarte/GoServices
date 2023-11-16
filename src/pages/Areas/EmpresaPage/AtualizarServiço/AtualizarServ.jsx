import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Container, Col, Row, Card } from "react-bootstrap";
import { getDoc, collection, doc, getFirestore, query, where, getDocs, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

const EmpresaAtualizaServico = () => {
  const [editMode, setEditMode] = useState(false);
  const [empresaInfo, setEmpresaInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState(null);
  const [servicosDaEmpresa, setServicosDaEmpresa] = useState([]);
  const history = useNavigate();
  const [selectedServicoId, setSelectedServicoId] = useState(null);

  const empresaRef = useRef(null);
  const nomeRef = useRef(null);
  const descricaoRef = useRef(null);
  const valorRef = useRef(null);

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
        const userId = user.uid;
        setId(userId);
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

  useEffect(()=>{
    async function fetchServicosEmpresa() {
      try {
        setIsLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        const uid = user ? user.uid : null;
    
        console.log("Fetching services for empresa with ID:", uid);
    
        const servicoRef = query(collection(db, "servico"), where("empresaId", "==", uid));
        const querySnapshot = await getDocs(servicoRef);
        const servicoInfo = [];
    
        for (const docSnapshot of querySnapshot.docs) {
          const servicoData = docSnapshot.data();
    
          servicoInfo.push({
            id: docSnapshot.id,
            ...servicoData,
          });
        }
    
        console.log("Fetched services:", servicoInfo);
    
        setServicosDaEmpresa(servicoInfo);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar serviços da empresa: ", error);
      }
    }
    fetchServicosEmpresa();
  }, [])
  
  useEffect(() => {
    if (empresaInfo && empresaInfo.id) {
      setServicosDaEmpresa(empresaInfo.servicos || []);
    }
  }, [empresaInfo]);
  

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        setIsLoading(true);
  
        const auth = getAuth();
        const user = auth.currentUser;
        const uid = user ? user.uid : null;
  
        if (uid) {
          const empresaDocRef = doc(db, "empresa", uid);
          const docSnapshot = await getDoc(empresaDocRef);
  
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setEmpresaInfo(data);
            setServicosDaEmpresa(data.servicos || []); 
          }
  
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao buscar informações: ", error);
        setIsLoading(false);
      }
    }
  
    fetchEmpresa();
  }, []);
  

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = async () => {
    try {
      const servicoRef = doc(db, "servico", id);

      await setDoc(servicoRef, {
        nome: nomeRef.current.value,
        descricao: descricaoRef.current.value,
        valor: valorRef.current.value,
      });

      setSuccessMessage("Dados encontrados com sucesso!");
      setErrorMessage("");
      setEditMode(false);
    } catch (error) {
      console.error("Erro ao salvar informações", error);
      setErrorMessage("Erro ao salvar informações: " + error.message);
    }
    setEditMode(false);
  };

  const handleCancelClick = () => {
    setSelectedServicoId(null);
    setEditMode(false);
  };

  const handleServicoSelect = (servicoId) => {
    setSelectedServicoId(servicoId);
    setEditMode(true);
  };

  return (
    <Container>
      {isLoading ? (
        <p>Carregando Informações...</p>
      ) : servicosDaEmpresa.length === 0 ? (
        <p>A empresa não possui serviços cadastrados.</p>
      ) : editMode ? (
        <Form style={{ width: "400px", margin: "0 auto", padding: "0px", marginTop: "40px" }}>
          {selectedServicoId !== null && (
            <div>
              <Row style={{ margin: "5px 0", textAlign: "left" }}>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Empresa:</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secondary">
                  <Form.Group>
                    <Form.Control type="text" ref={empresaRef} value={empresaInfo.nome || ""} readOnly />
                  </Form.Group>
                </Col>
              </Row>
              <Row style={{ margin: "5px 0", textAlign: "left" }}>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Nome do Serviço</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secondary">
                  <Form.Group>
                    <Form.Control type="text" ref={nomeRef} defaultValue={servicosDaEmpresa[selectedServicoId].nome || ""} />
                  </Form.Group>
                </Col>
              </Row>
              <Row style={{ margin: "5px 0", textAlign: "left" }}>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Descrição do Serviço</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secondary">
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      ref={descricaoRef}
                      style={{ backgroundColor: "white", width: "20vw" }}
                      defaultValue={servicosDaEmpresa[selectedServicoId].descricao || ""}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row style={{ margin: "5px 0", textAlign: "left" }}>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Valor do Serviço</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secondary">
                  <Form.Group>
                    <Form.Control type="text" ref={valorRef} defaultValue={servicosDaEmpresa[selectedServicoId].valor || ""} />
                  </Form.Group>
                </Col>
              </Row>
              <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "10px" }}>
                <Button variant="primary" onClick={handleSaveClick} style={{ margin: "10px" }}>
                  Salvar
                </Button>
                <Button variant="primary" onClick={handleCancelClick} style={{ margin: "10px" }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          {successMessage && <div className="successMessage">{successMessage}</div>}
          {errorMessage && <div className="errorMessage">{errorMessage}</div>}
        </Form>
      ) : (
        <div>
        {servicosDaEmpresa.map((servico, index) => (
          <div key={index}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <strong>Nome do Serviço:</strong>
                  </Col>
                  <Col md={9} className="text-secondary">
                    {servico.nome && <span>{servico.nome}</span>}
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col md={3}>
                    <strong>Descrição:</strong>
                  </Col>
                  <Col md={9} className="text-secondary">
                    {servico.descricao && <span>{servico.descricao}</span>}
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col md={3}>
                    <strong>Valor:</strong>
                  </Col>
                  <Col md={9} className="text-secondary">
                    {servico.valor && <span>R$ {servico.valor}</span>}
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col md={3}>
                    <strong>Empresa:</strong>
                  </Col>
                  <Col md={9} className="text-secondary">
                    {empresaInfo.nome && <span>{empresaInfo.nome}</span>}
                  </Col>
                </Row>
                <hr />
                <Button onClick={() => handleServicoSelect(index)}>Editar</Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      )}
    </Container>
  );
  
};

export default EmpresaAtualizaServico;

