import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Container, Col, Row, Card } from "react-bootstrap";
import { getDoc, collection, doc, getFirestore, query, where, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";

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

const EmpresaAtualizaServico = () => {
  const [editMode, setEditMode] = useState(false);
  const [empresaInfo, setEmpresaInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState(null);
  const [servicosDaEmpresa, setServicosDaEmpresa] = useState([]);
  const history = useNavigate();
  const [selectedServicoId, setSelectedServicoId] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);

  const empresaRef = useRef(null);
  const nomeRef = useRef(null);
  const descricaoRef = useRef(null);
  const valorRef = useRef(null);
  const imgRef = useRef(null);

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
            setServicosDaEmpresa(data.servicos);
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

  const fetchServicosEmpresa = async () => {
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
  
      return servicoInfo; // Alteração aqui
    } catch (error) {
      console.error("Erro ao buscar serviços da empresa: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      const services = await fetchServicosEmpresa();
      setServicosDaEmpresa(services);
    };
  
    fetchData();
  }, []); // Remova a chamada direta aqui  


  const handleCancelClick = () => {
    setSelectedServicoId(null);
    setEditMode(false);
  };

  const handleServicoSelect = (servicoId) => {
    setSelectedServicoId(servicoId);
    setEditMode(true);
  
    const selectedServico = servicosDaEmpresa[servicoId];
    if (nomeRef.current) {
      nomeRef.current.value = selectedServico.nome || "";
    }   
    if(descricaoRef.current){
      descricaoRef.current.value = selectedServico.descricao || "";
    } 
    if(valorRef.current){
      valorRef.current.value = selectedServico.valor || "";
    }
    if(imgRef.current){
      imgRef.current.value = selectedServico.img || null;
    }
  };
  
  const handleSaveClick = async () => {
    try {
      setIsLoading(true);
  
      const auth = getAuth();
      const user = auth.currentUser;
      const uid = user ? user.uid : null;
  
      if (!uid) {
        throw new Error("Usuário não autenticado.");
      }
  
      // Verificar se o serviço está associado à empresa
      if (servicosDaEmpresa && servicosDaEmpresa[selectedServicoId]) {
        const servicoId = servicosDaEmpresa[selectedServicoId].id;
  
        const updatedServico = {
          nome: nomeRef.current.value,
          descricao: descricaoRef.current.value,
          valor: valorRef.current.value,
          img: imgUrl,
        };
  
        // Atualizar no Firebase
        const servicoDocRef = doc(db, "servico", servicoId);
        await setDoc(servicoDocRef, updatedServico, { merge: true });
  
        // Atualizar na API
        const configServico = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedServico),
        };
  
        const response = await fetch(`http://localhost:3000/empresa/servico/${servicoId}`, configServico);
  
        if (!response.ok) {
          throw new Error("Erro na solicitação da API");
        }
  
        setSuccessMessage("Dados atualizados com sucesso!");
        setErrorMessage("");
        setEditMode(false);
  
        const services = await fetchServicosEmpresa();
        setServicosDaEmpresa(services);
      } else {
        throw new Error("O serviço não está associado à empresa.");
      }
    } catch (error) {
      console.error("Erro ao salvar informações", error);
      setErrorMessage("Erro ao salvar informações: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageSelect = async (e) => {
    const imgFile = e.target.files[0];
    if (imgFile) {
      try {
        const imgUrl = await uploadImage(imgFile);
        setImgUrl(imgUrl); // Atualiza o estado imgUrl
      } catch (error) {
        console.error("Erro ao selecionar a imagem:", error);
      }
    }
  };
  
  const uploadImage = async (imgFile) => {
    const storageRef = ref(storage, 'imagens/' + imgFile.name);

    try {
      const snapshot = await uploadBytes(storageRef, imgFile);
      const imgUrl = await getDownloadURL(snapshot.ref);
      console.log('Imagem adicionada com sucesso:', imgUrl);
      return imgUrl;
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      throw error;
    }
  };

// ... (código anterior)

const handleDeleteClick = () => {
  if (selectedServicoId !== null) {
    handleDelete(selectedServicoId); // Passa o selectedServicoId diretamente para handleDelete
  } else {
    console.error("Selecione um serviço antes de excluir.");
  }
};

const handleDelete = async (servicoId) => { 
  try {
    setIsLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user ? user.uid : null;

    if (!uid) {
      throw new Error("Usuário não autenticado.");
    }

    console.log("Serviços da Empresa:", servicosDaEmpresa);
    console.log("Serviço Selecionado:", servicoId);

    // Verifica se o índice é válido e se o serviço está presente na lista
    if (Number.isInteger(servicoId) && servicoId >= 0 && servicoId < servicosDaEmpresa.length) {
      const servicoToDelete = servicosDaEmpresa[servicoId]?.id;

      if (!servicoToDelete) {
        throw new Error("O serviço selecionado não tem um ID válido.");
      }

      // Verificar se há agendamentos associados a este serviço
      const agendamentoRef = collection(db, "agendamento");
      const q = query(agendamentoRef, where("servicoId", "==", servicoToDelete));
      const agendamentoQuerySnapshot = await getDocs(q);
      const agendamentosAssociados = agendamentoQuerySnapshot.docs.length > 0;

      if (agendamentosAssociados) {
        throw new Error("Existem agendamentos associados a este serviço. Não é possível excluí-lo.");
      }

      // Continuar com a exclusão do serviço se não houver agendamentos associados
      const deleteConfig = {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json'
        },
      };

      const response = await fetch(`http://localhost:3000/servico/remove/${servicoToDelete}`, deleteConfig);

      if (!response.ok) {
        throw new Error("Erro na solicitação da API");
      }

      const updatedServicosDaEmpresa = servicosDaEmpresa.filter((servico, index) => index !== servicoId);
      setServicosDaEmpresa(updatedServicosDaEmpresa);

      setSuccessMessage('Serviço excluído com sucesso!');
      setErrorMessage('');
    } else {
      throw new Error("O índice do serviço não é válido ou o serviço não está presente na lista.");
    }
  } catch (error) {
    console.error("Erro ao excluir serviço", error);
    setErrorMessage('Erro ao excluir serviço: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <Container>
      {isLoading ? (
        <p>Carregando Informações...</p>
      ) : servicosDaEmpresa && servicosDaEmpresa.length === 0 ? (
        <p>A empresa não possui serviços cadastrados.</p>
      ) : editMode ? (
        <Form className="formServ">
          {selectedServicoId !== null && (
            <div>
              <Row className="rowServ">
                <Col>
                <img className="img" src={imgUrl} alt={servicosDaEmpresa[selectedServicoId].nome} />

                </Col>
              </Row>
              <Row style={{ margin: "12px", marginBottom: "20px" }}>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Escolha uma nova imagem:</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9}>
                <Form.Control
                  type="file"
                  accept="image/*"
                  ref={imgRef}
                  style={{ width: "400px", height: "30px", backgroundColor: " #333333", width: "100%" }}
                  onChange={(e) => handleImageSelect(e)}
                />
                </Col>
              </Row>

              <Row style={{margin: "12px", marginBottom: "20px"}}>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Nome do Serviço</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secondary">
                  <Form.Group >
                    <Form.Control type="text" ref={nomeRef} defaultValue={servicosDaEmpresa[selectedServicoId].nome || ""} 
                    style={{width: "100%"}}/>
                  </Form.Group>
                </Col>
              </Row>
              <Row style={{margin: "12px", marginBottom: "20px"}}>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label  style={{color: "black" }}>Descrição do Serviço</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secondary">
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      ref={descricaoRef}
                      style={{  width: "100%" }}
                      defaultValue={servicosDaEmpresa[selectedServicoId].descricao || ""}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row style={{margin: "12px", marginBottom: "20px"}}>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ color: "black" }}>Valor do Serviço</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={9} className="text-secondary">
                  <Form.Group>
                    <Form.Control type="text" ref={valorRef} defaultValue={servicosDaEmpresa[selectedServicoId].valor || ""}
                    style={{width: "100%"}} />
                  </Form.Group>
                </Col>
              </Row>
              <div style={{margin: "20px"}}>
              <Button
                    variant="primary"
                    onClick={handleSaveClick}
                    className="buttonServ"
                  >
                    Salvar
                  </Button>
                <Button variant="primary" onClick={handleCancelClick} className="buttonServ">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          {successMessage && <div className="successMessage">{successMessage}</div>}
          {errorMessage && <div className="errorMessage">{errorMessage}</div>}
        </Form>
      ) : (
        <div className="services-container">
        {servicosDaEmpresa && servicosDaEmpresa.map((servico, index) => (
          <div key={index} className="service-card">
            <Card>
              <Card.Body className="cardServ">
                <Row className="rowServ">
                  <Col>
                  <img className="img" src={servico.img} alt={servico.nome} />
                  </Col>
                </Row>
                <Row className="rowServ">
                  <Col md={3}>
                    <strong>Nome do Serviço: </strong>
                    {servico.nome && <span>{servico.nome}</span>}
                  </Col>
                </Row>
                <Row className="rowServ">
                  <Col md={3}>
                    <strong>Descrição: </strong>
                    {servico.descricao && <span>{servico.descricao}</span>}
                  </Col>
                </Row>
                <Row className="rowServ">
                  <Col md={3}>
                    <strong>Valor: </strong>
                    {servico.valor && <span>R$ {servico.valor}</span>}
                  </Col>
                </Row>
                <Button className="buttonServ" onClick={() => handleServicoSelect(index)}>Editar</Button>
                <Button className="buttonServ1" onClick={() => handleDelete(index)}>Excluir</Button>
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

