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
  const [servicoInfo, setServicoInfo] = useState({});
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
    }catch (error) {
      console.error("Erro ao verificar a função do usuário: ", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserRole();
  }, [history]);

  const fetchServicosEmpresa = async (empresaId) => {
    try {
      const servicoRef = collection(db, "servico");
      const q = query(servicoRef, where("empresaId", "==", empresaId));
      const querySnapshot = await getDocs(q);

      const servicos = [];
      querySnapshot.forEach((doc) => {
        servicos.push({ id: doc.id, ...doc.data() });
      });

      setServicosDaEmpresa(servicos);
    } catch (error) {
      console.error("Erro ao buscar serviços da empresa: ", error);
    }
  };

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
            setServicoInfo({ ...servicoInfo, id: data.id }); 
          }
  
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao buscar informações: ", error);
        setIsLoading(false);
      }
    }
  
    fetchEmpresa();
  }, [servicoInfo, setServicoInfo]);
  
  useEffect(() => {
    if (empresaInfo && servicoInfo.id) {
      fetchServicosEmpresa(servicoInfo.id);
    }
  }, [servicoInfo, setServicoInfo]);
  

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = async () => {
    try {
      const servicoRef = doc(db, "servico", id);

      await setDoc(servicoRef, servicoInfo, { merge: true });

      const response = await fetch(`http://localhost:3000/servicos/${id}`);

      if (!response.ok) {
        throw new Error("Erro ao enviar solicitação API");
      }
      const data = await response.json();
      setServicoInfo(data);
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
                    <Form.Control type="text" ref={nomeRef} value={servicosDaEmpresa[selectedServicoId].nome || ""} />
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
                    <Form.Control as="textarea" rows={3} ref={descricaoRef} style={{ backgroundColor: "white", width: "20vw" }} value={servicosDaEmpresa[selectedServicoId].descricao || ""} />
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
                    <Form.Control type="text" ref={valorRef} value={servicosDaEmpresa[selectedServicoId].valor || ""} />
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
                      {servico.nome}
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col md={3}>
                      <strong>Descrição:</strong>
                    </Col>
                    <Col md={9} className="text-secondary">
                      {servico.descricao}
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col md={3}>
                      <strong>Valor:</strong>
                    </Col>
                    <Col md={9} className="text-secondary">
                      R$ {servico.valor}
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col md={3}>
                      <strong>Empresa:</strong>
                    </Col>
                    <Col md={9} className="text-secondary">
                      {empresaInfo.nome}
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

