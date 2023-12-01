import React, { useEffect, useState } from "react";
import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { appF } from "../../backend/Firebase/firebase";
import './css/Homepage.css';

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

export function HomePage() {
  const [servicos, setServicos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const { servicoId } = useParams();
  const [servicoData, setServicoData] = useState(null);
  const [clienteData, setClienteData] = useState(null);
  const [empresaData, setEmpresaData] = useState(null);
  const servicoRef = collection(db, "servico");
  const clienteRef = collection(db, "cliente");
  const empresaRef = collection(db, "empresa");
  const profissionalRef = collection(db, "profissional");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const history = useNavigate(); 

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchServicos() {
      try {
        const querySnapshot = await getDocs(collection(db, "servico"));
        const servicoData = [];
        querySnapshot.forEach((doc) => {
          servicoData.push({ id: doc.id, data: doc.data() });
        });
        setServicos(servicoData);
      } catch (error) {
        console.error("Erro ao buscar os serviços:", error);
      }
    }

    fetchServicos();

  }, []);

  const categorias = [...new Set(servicos.map((servico) => {
    if (servico.data && servico.data.categoria) {
      const categoria = servico.data.categoria; // Remova o [0]
      if (categoria) {
        return categoria.toUpperCase();
      }
    }
    return null;
  }).filter(Boolean))];
  
  const sortedServicos = [...servicos].sort((a, b) => {
    const categoriaA = a.data && a.data.categoria;
    const categoriaB = b.data && b.data.categoria;
  
    if (categoriaA && categoriaB) {
      return categoriaA.localeCompare(categoriaB);
    }
  
    // Se uma das categorias for undefined, considere-as iguais para evitar erros
    return 0;
  });
  
  const filteredServicos = selectedCategory
    ? sortedServicos.filter((servico) =>
        selectedCategory.toLowerCase() === "todos" ||
        (servico.data?.categoria?.toLowerCase() === selectedCategory.toLowerCase())
      )
    : sortedServicos;
  


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

  const navigateToAgendamento = (servico) => {
    const auth = getAuth(appF);

    onAuthStateChanged(auth, (user)=>{
      if(user){
        const uid = user.uid;

        history(`/agendamento/${servico.id}`); 
      }else{
        alert("Você precisa estar logado para realizar esta ação.");
      history('/login');
      }
    }) 
  };

  const navigateToFavoritos = async (servico) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const uid = user ? user.uid : null;
  
      if (user) {
        const favoritoSnapshot = await getDocs(
          query(
            collection(db, "favorito"),
            where("clienteId", "==", uid),
            where("servicoId", "==", servico.id)
          )
        );
        
        if (favoritoSnapshot.size > 0) {
          console.log("O serviço já está nos favoritos");
          setErrorMessage("O serviço já está favoritado");
          return;
        }

        try {
          const servicoSnapshot = await getDoc(doc(db, "servico", servico.id));
          const servicoData = servicoSnapshot.data();
          
          if (!servicoData) {
            throw new Error("Detalhes do serviço não encontrados");
          }
  
          try {
            const favoritoData = {
              clienteId: uid,
              empresaId: servicoData.empresaId,
              servicoId: servico.id,
            };
  
            const configFavorito = {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(favoritoData),
            };
  
            const response = await fetch("http://localhost:3000/addFavoritos", configFavorito);
  
            if (!response.ok) {
              throw new Error("Erro na solicitação da API");
            }
  
            const responseData = await response.json();
            console.log('Resposta da API:', responseData);
  
            const favoritoRef = collection(db, "favorito");
            const docRef = await addDoc(favoritoRef, favoritoData);
            console.log("Favorito adicionado com sucesso! Document ID: ", docRef.id);
  
          } catch (error) {
            console.error("Erro ao adicionar favoritos: ", error);
          }
  
          // Navegar para a página de favoritos
          history(`/favoritos/${servico.id}`);
        } catch (error) {
          console.error("Erro ao obter detalhes do serviço: ", error);
        }
      } else {
        alert("Você precisa estar logado para realizar esta ação.");
        history('/login');
      }
    } catch (error) {
      console.error("Erro ao navegar para favoritos: ", error);
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  };

  const itemsPerRow = 7;
  return (
    <main className="main-home">
      {successMessage && <div className="successMessageCli">{successMessage}</div>}
      {errorMessage && <div className="errorMessageCli">{errorMessage}</div>}

      <div className="header-container">
        <h2 className="h1-home">Lista de Serviços:</h2>

        <div className="categorias">
          <button onClick={() => setSelectedCategory(null)}>Todos</button>
          {categorias.map((categoria) => (
            <button key={categoria} onClick={() => setSelectedCategory(categoria)}>
              {categoria}
            </button>
          ))}
        </div>
      </div>

      <div className="container-home">
        {filteredServicos.map((servico, index) => (
          <div className="card-container-home" key={servico.id}>
            <img src={servico.data.img} alt={servico.data.nome} className="img" />
            <div className="card-body-home">
              <div style={{ marginBottom: "-10px" }}>
                <h5 className="card-title">
                  {servico.data.nome}
                </h5>
                <p style={{ fontSize: "15px", display: "flex", color: "#0F1111", textAlign: "left" }}>
                  {servico.data.empresa}
                </p>
                <div className="card-description-home">
                {isDescriptionExpanded ? (
                  servico.data.descricao
                ) : (
                  <>
                    {truncateText(servico.data.descricao, 30)} {/* Limita a descrição a 100 caracteres */}
                    <button onClick={() => setIsDescriptionExpanded(true)}>Mostrar Mais</button>
                  </>
                )}
              </div>
              </div>
              <div className="card-price-home">
                R$: <span style={{ fontSize: "28px", color: "#0F1111" }}>{getDecimal(servico.data.valor).integerPart}</span>
                <span style={{ fontSize: "13px", top: "-.75em", color: "#0F1111" }}>
                  .{getDecimal(servico.data.valor).decimalPart}
                </span>
              </div>
            </div>
            <div className="card-footer-home">
              <button
                onClick={() => navigateToFavoritos(servico)}
                className="favoritoButton"
              >
                ❤️
              </button>
              <button
                onClick={() => navigateToAgendamento(servico)}
                className="agendarButton"
              >
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
  
}

