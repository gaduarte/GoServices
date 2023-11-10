import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Container, Table, Col, Row } from "react-bootstrap";
import { getDoc, collection, doc, addDoc, getFirestore, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
const storage = getStorage(app);

const EmpresaAddServico = () => {
  const [showAddService, setShowAddService] = useState(false);
  const [services, setServices] = useState([]);
  const [empresaInfo, setEmpresaInfo] = useState([]);
  const [id, setId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingService, setAddingService] = useState(false);
  const [serviceAdded, setServiceAdded] = useState(false);
  const history = useNavigate();

  const descricaoRef = useRef(null);
  const nomeRef = useRef(null);
  const valorRef = useRef(null);
  const empresaRef = useRef(null);

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

    checkUserRole();
  }, []);

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
            console.log("Dados da empresa:", data);
            setEmpresaInfo(data);
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

  useEffect(() => {
    if (empresaInfo && empresaInfo.nome) {
      empresaRef.current.value = empresaInfo.nome;
    }
  }, [empresaInfo]);

  const handleAddService = async () => {
    setShowAddService(true);
    setAddingService(true);
  };

  const handleCancelClick = () => {
    setShowAddService(false);
    setAddingService(false);
    setServiceAdded(false); // Para evitar duplicação
  };

  const handleServiceSubmit = async (imgUrl) => {
    if (serviceAdded) {
      return; // Se o serviço já foi adicionado, retorna para evitar duplicação
    }

    setServiceAdded(true); // Marca que o serviço foi adicionado

    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user ? user.uid : null;

    if (uid) {
      const empresaDocRef = doc(db, "empresa", uid);
      const docSnapshot = await getDoc(empresaDocRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setEmpresaInfo(data);
      }

      const descricao = descricaoRef.current.value;
      const nome = nomeRef.current.value;
      const valor = parseFloat(valorRef.current.value);
      const empresa = empresaRef.current.value;

      try {
        const newService = {
          descricao,
          nome,
          valor,
          empresa,
          empresaId: uid,
          img: imgUrl,
        };

        const configServico = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newService),
        };

        const response = await fetch("http://localhost:3000/addServico", configServico);

        if (!response.ok) {
          throw new Error("Erro na solicitação da API");
        }

        const responseData = await response.json();
        console.log('Resposta da API:', responseData);
        setSuccessMessage('Serviço cadastrado com sucesso!');
        setErrorMessage('');

        // Adicionando o novo serviço à coleção 'servico' no Firebase
        const docRef = await addDoc(collection(db, "servico"), newService);

        setServices([...services, { id: docRef.id, ...newService }]);

        // Limpa os campos do formulário
        descricaoRef.current.value = "";
        nomeRef.current.value = "";
        valorRef.current.value = "";
        empresaRef.current.value = "";

        console.log('Serviço cadastrado com sucesso!');
        setSuccessMessage('Serviço cadastrado com sucesso!');
        setErrorMessage('');
      } catch (error) {
        console.error("Erro ao adicionar serviço", error);
        setErrorMessage("Erro ao adicionar serviço: " + error.message);
      } finally {
        setAddingService(false);
      }
    }
  };

  const uploadImage = async (imgFile) => {
    const storageRef = ref(storage, 'imagens/' + imgFile.name);

    try {
      const snapshot = await uploadBytes(storageRef, imgFile);
      const imgUrl = await getDownloadURL(storageRef);
      console.log('Imagem adicionada com sucesso.');
      return imgUrl;
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      throw error;
    }
  };

  const handleImageSelect = async (e) => {
    const imgFile = e.target.files[0];
    if (imgFile) {
      try {
        const imgUrl = await uploadImage(imgFile);
        handleServiceSubmit(imgUrl);
      } catch (error) {
        console.error("Erro ao selecionar a imagem:", error);
      }
    }
  };

  return (
    <Container>
      {successMessage && <div className="successMessage">{successMessage}</div>}
      {errorMessage && <div className="errorMessage">{errorMessage}</div>}

      <Form style={{ width: "400px", margin: "0 auto", padding: "0px", marginTop: "40px" }}>
        <Row style={{ margin: "5px 0", textAlign: "left" }}>
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ color: "black" }}>Empresa:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9} className="text-secundary">
            <Form.Group>
              <Form.Control type="text" ref={empresaRef} value={empresaInfo.username || ""} readOnly />
            </Form.Group>
          </Col>
        </Row>
        <Row style={{ margin: "5px 0", textAlign: "left" }}>
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ color: "black" }}>Nome do Serviço</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9} className="text-secundary">
            <Form.Control type="text" ref={nomeRef} />
          </Col>
        </Row>
        <Row style={{ margin: "5px 0", textAlign: "left" }}>
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ color: "black" }}>Descrição do Serviço</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9} className="text-secundary">
            <Form.Control type="textarea" rows={3} ref={descricaoRef} style={{ backgroundColor: "white", width: "20vw" }} />
          </Col>
        </Row>
        <Row style={{ margin: "5px 0", textAlign: "left" }}>
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ color: "black" }}>Valor do Serviço</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9} className="text-secundary">
            <Form.Control type="text" ref={valorRef} />
          </Col>
        </Row>
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ color: "black" }}>Escolha uma imagem:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
            <Form.Control type="file" accept="image/*" onChange={handleImageSelect} />
          </Col>
        </Row>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "10px" }} >
          <Button variant="primary" onClick={handleServiceSubmit} style={{ margin: "10px" }}>
            Adicionar
          </Button>
          <Button onClick={handleCancelClick} style={{ padding: "2px", margin: "10px", color: "#f44336", borderRadius: "5px" }}>Cancelar</Button>
        </div>
      </Form>
    </Container>
  );
};

export default EmpresaAddServico;




