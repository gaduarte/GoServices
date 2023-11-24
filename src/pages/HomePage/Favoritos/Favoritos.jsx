import React, { useEffect, useRef, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import '../css/Homepage.css';


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

const Favoritos = () => {
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

  function getDecimal(value){
    const stringValue = value.toString();
    let [integerPart, decimalPart] = stringValue.split('.');

    if (decimalPart === undefined) {
    decimalPart = '00';
  } else if (decimalPart.length === 1) {
    decimalPart += '0';
  }

    return {
      integerPart,
      decimalPart,
  };
  }

  return (
    <main className="main">
      <div className="containerFav">
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          <div>
            {servicoData && servicoData.img && (
              <img className="img" src={servicoData.img} alt={servicoData.nome} />
            )}
            <div className="card-body">
              {servicoData && <h5 className="card-title-fav">{servicoData.nome}</h5>}
              {servicoData && (
                <p style={{ fontSize: "15px", display: "flex", color: "#0F1111", textAlign: "left" }}>
                  {servicoData.empresa}
                </p>
              )}
              {servicoData && <p className="card-description-fav">{servicoData.descricao}</p>}
              {servicoData && (
                <div className="card-price">
                  R$: {' '}
                  <span style={{ fontSize: "28px", color: "#0F1111" }}>
                    {getDecimal(servicoData.valor).integerPart}
                  </span>
                  <span style={{ fontSize: "13px", top: "-.75em", color: "#0F1111" }}>
                    .{getDecimal(servicoData.valor).decimalPart}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <button className="buttonFav"><a href="/">Voltar</a></button>
    </main>
  );
}
export default Favoritos;