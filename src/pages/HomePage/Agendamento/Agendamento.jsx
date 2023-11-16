import React, { useEffect, useRef, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";


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

const Agendamento = () => {
  const { servicoId } = useParams();
  const [servicoData, setServicoData] = useState(null);
  const [clienteData, setClienteData] = useState(null);
  const [cartao, setCartaoCliente] = useState(null);
  const [horarios, setHorarios] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [empresaData, setEmpresaData] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [selectedProfissional, setSelectedProfissional] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const history = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAgendado, setIsAgendado] = useState(false);


  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const servicoRef = collection(db, "servico");
  const clienteRef = collection(db, "cliente");
  const empresaRef = collection(db, "empresa");
  const profissionalRef = collection(db, "profissional");
  const horarioRef = collection(db, "horariosDisponiveis");


  const checkUserInClienteCollection = async (email) => {
    const usersRef = collection(db, "cliente");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const checkUserRole = async () => {
    try {
      // Verifica se o usuário está logado
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        history("/login");
      } else {
        // Obtém o email do usuário logado
        const email = user.email;

        // Consulta a coleção "cliente" com base no email do usuário logado
        const q = query(clienteRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Define o cliente logado
          const cliente = querySnapshot.docs[0].data();
          setClienteData(cliente);

          const clienteId = querySnapshot.docs[0].id;
          const cartaoQuery = query(collection(clienteRef, clienteId, "cartao"));
          const cartaoSnapshot = await getDocs(cartaoQuery);
          const cartaoData = cartaoSnapshot.docs.map((cartaoDoc) => ({
            id: cartaoDoc.id,
            ...cartaoDoc.data(),
          }));
          setCartaoCliente(cartaoData);
        } else {
          history("/login");
        }
      }
    } catch (error) {
      console.error("Erro ao verificar a função do usuário: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserRole();
  }, [history]);

  useEffect(() => {
    async function fetchProfissionais(servicoId) {
      try {
        const profissionaisData = [];
  
        // Consulte o serviço específico usando servicoId
        const servicoDoc = await getDoc(doc(db, 'servico', servicoId));
  
        if (servicoDoc.exists()) {
          const profissional = servicoDoc.data().profissional;
  
          // Consulte o profissional com base no profissionalId
          const profissionalDoc = await getDoc(doc(db, 'profissional', profissional));
  
          if (profissionalDoc.exists()) {
            profissionaisData.push({ id: profissionalDoc.id, data: profissionalDoc.data() });
          }
        }
  
        setProfissionais(profissionaisData);
      } catch (error) {
        console.error('Erro ao buscar os profissionais:', error);
      }
    }
  
    if (servicoId) {
      fetchProfissionais(servicoId);
    }
  }, [servicoId]);
  
  

  useEffect(() => {
    async function fetchServico() {
      try {
        const querySnapshot = await getDocs(servicoRef);
        querySnapshot.forEach((doc) => {
          if (doc.id === servicoId) {
            setServicoData(doc.data());
          }
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar Serviço", error);
        setIsLoading(false);
      }
    }
    if (servicoId) {
      fetchServico();
    }
  }, [servicoId]);

  useEffect(() => {
    async function fetchClientes() {
      try {
        setIsLoading(true);

        const auth = getAuth();
        const user = auth.currentUser;
        const uid = user ? user.uid : null;

        if (uid) {
          const clienteRef = doc(db, "cliente", uid);

          const docSnapshot = await getDoc(clienteRef);
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setClienteData(data);
          }

          const cartaoQuerySnapshot = await getDocs(collection(clienteRef, "cartao"));
          const cartaoData = cartaoQuerySnapshot.docs.map((cartaoDoc) => ({
            id: cartaoDoc.id,
            ...cartaoDoc.data(),
          }));

          setCartaoCliente(cartaoData);
        }
      } catch (error) {
        console.error("Erro ao buscar os clientes:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClientes();
  }, [setCartaoCliente]);
  

  useEffect(() => {
    async function fetchHorarios() {
      try {
        setIsLoading(true);
  
        // Verificar se servicoData está definido
        if (!servicoData) {
          console.error("Erro: servicoData não está definido");
          setIsLoading(false);
          return;
        }
  
        const horariosQuerySnapshot = await getDocs(query(horarioRef, where("empresaId", "==", servicoData.empresaId)));
        const horariosData = [];
  
        horariosQuerySnapshot.forEach((doc) => {
          const horarioInfo = doc.data();
  
          // Verificar se o horário está disponível (status 0)
          if (horarioInfo.status === false) {
            horariosData.push({
              id: doc.id,
              ...horarioInfo,
            });
          }
        });
  
        setHorarios(horariosData);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar informações de horários disponíveis: ", error);
        setIsLoading(false);
      }
    }
  
    fetchHorarios();
  }, [servicoData, horarioRef]);
   


  useEffect(() => {
    async function fetchCartaoCliente() {
      try {
        setIsLoading(true);
  
        if (clienteData && clienteData.id) {
          // Consulta a subcoleção "cartao" dentro do documento do cliente
          const clienteId = clienteData.id; // Get the client's ID
          const cartaoQuery = query(collection(clienteRef, clienteId, "cartao")); 
          const cartaoSnapshot = await getDocs(cartaoQuery);
  
          if (!cartaoSnapshot.empty) {
            
            const cartoes = [];
            cartaoSnapshot.forEach((doc) => {
              cartoes.push(doc.data());
            });
            setCartaoCliente(cartoes);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar os cartões do cliente:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCartaoCliente();
  }, [clienteData, clienteRef]);
  

  const handleAgendamento = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      const agendamentoData = {
        clienteId: uid, 
        empresaId: servicoData.empresaId,
        profissionalId: selectedProfissional,
        servicoId: servicoId,
        cartao: cartao[0].id,
        dataAgendamento: selectedHorario
      };

      const configAgendamento = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agendamentoData),
      };

      const response = await fetch("http://localhost:3000/addAgendamento", configAgendamento);

      if(!response.ok){
        throw new Error("Erro na solicitação da API");
      }

      const responseData = await response.json();
      console.log('Resposta da API:', responseData);
      setSuccessMessage('Serviço cadastrado com sucesso!');
      setErrorMessage('');

      const agendamentoRef = collection(db, "agendamento");

      const docRef = await addDoc(agendamentoRef, agendamentoData);
      console.log("Agendamento adicionado com sucesso! Document ID: ", docRef.id);
      const horarioDocRef = doc(db, "horariosDisponiveis", selectedHorario);
      await updateDoc(horarioDocRef, {status: true});
      setIsAgendado(true);
    } catch (error) {
      console.error("Erro ao adicionar agendamento: ", error);
    }
  };

  return (
    <div className="card-container-agendamento">
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <div className="service-details">
          {isAgendado ? (
            <p>Status: Agendado</p>
          ) : (
            <>
              {servicoData && servicoData.img && (
                <img className="imagem" src={servicoData.img} alt={servicoData.nome} />
              )}
  
              <div className="service-info">
                {servicoData && <h3>{servicoData.nome}</h3>}
                {servicoData && <p>Empresa: {servicoData.empresa}</p>}
                {clienteData && <p>Cliente: {clienteData.username}</p>}
                {clienteData && <p>Endereço: {clienteData.endereco}</p>}
                {servicoData && <p>Valor: {servicoData.valor}</p>}
              </div>
  
              <div className="professional-section">
                <select
                  className="select-dif"
                  value={selectedProfissional}
                  onChange={(e) => setSelectedProfissional(e.target.value)}
                >
                  <option value="">Selecione um Profissional</option>
                  {profissionais.map((profissional) => (
                    <option key={profissional.id} value={profissional.id}>
                      {profissional.data.username}
                    </option>
                  ))}
                </select>
  
                {selectedProfissional && profissionais && (
                  <div>
                    {profissionais.map((profissional) => {
                      if (profissional.id === selectedProfissional) {
                        return (
                          <div key={profissional.id}>
                            <p>Profissional selecionado: {profissional.data.username}</p>
                          </div>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </div>
                )}
              </div>
  
              <div className="schedule-section">
                <select
                  className="select-dif"
                  value={selectedHorario}
                  onChange={(e) => setSelectedHorario(e.target.value)}
                >
                  <option value="">Selecione Horário</option>
                  {horarios &&
                    horarios.map((horario, index) => (
                      <option key={index} value={horario.id}>
                        {horario.horario}
                      </option>
                    ))}
                </select>
  
                {selectedHorario && horarios && (
                  <div>
                    {horarios.map((horario, index) => {
                      if (horario.horario === selectedHorario) {
                        return (
                          <div key={index}>
                            <p>Horário: {horario.horario}</p>
                          </div>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </div>
                )}
              </div>
  
              <div className="card-section-agendamento">
                <select
                  className="select-dif"
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                >
                  <option value="">Selecione um cartão</option>
                  {cartao &&
                    cartao.map((cartao, index) => (
                      <option key={index} value={cartao.numero}>
                        {cartao.numero}
                      </option>
                    ))}
                </select>
  
                {selectedCard && cartao && (
                  <div>
                    {cartao.map((cartao, index) => {
                      if (cartao.numero === selectedCard) {
                        return (
                          <div key={index}>
                            <p>Nome no Cartão: {cartao.nome}</p>
                            <p>Código do Cartão: {cartao.codigo}</p>
                          </div>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </div>
                )}
              </div>
  
              <div className="service-details-bottom">
                <button className="buttonAgendar" onClick={handleAgendamento}>
                  Agendar
                </button>
              </div>
              <button className="buttonAgendar2">
                <a href="/">Voltar</a>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
  
}

export default Agendamento;


