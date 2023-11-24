import React, { useState, useEffect } from "react";
import {collection, getDocs, getFirestore, query} from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { FaSearch } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './css/Search.css';
import { appF } from "../../backend/Firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
  
export function SearchT() {
    const [searchResults, setSearchResults] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const history = useNavigate();
    const location = useLocation();

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
    console.log("servicos:", servicos);
  }, []);

  const handleSearch = () => {
    const searchTerm = searchQuery.toLowerCase().trim();
    const results =
      searchTerm === ""
        ? servicos
        : servicos.filter((servico) => {
            const nomeIncludesTerm = servico.data.nome.toLowerCase().includes(searchTerm);
            const descricaoIncludesTerm = servico.data.descricao.toLowerCase().includes(searchTerm);
            return nomeIncludesTerm || descricaoIncludesTerm;
          });

    setSearchResults(results);
    console.log("searchResults:", searchResults);

    if (results.length === 1) {
      const servicoId = results[0].id;
      history(`/detalhes/${servicoId}`);
    } else {
      history(`/resultados?query=${searchTerm}`);
    }
  };

  const isResultadosPage = location.pathname.includes("/resultados");

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

  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Pesquisar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          style={{ height: "20px", width: "100%", padding: "3px", margin: "1px", marginTop: "14px" }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "5px 10px",
            height: "24px",
            cursor: "pointer",
            width: "30px",
            color: "white",
            marginTop: "2px",
            marginLeft: "10px",
            marginBottom: "-10px",
          }}
        >
          <FaSearch size={12} />
        </button>
      </div>
      {
        searchResults.map((result) => (
          <div key={result.id} className="container-search">
            <img src={result.data.img} alt={result.data.nome} className="img-search"/>
            <div className="card-search-nome">
              <h2>{result.data.nome}</h2>
            </div>
            <div className="card-search">
              <p>{result.data.descricao}</p>
            </div>
            <div className="valor-search">
              <p>Valor: {result.data.valor}</p>
            </div>
            <button
              onClick={() => navigateToAgendamento(result)}
              className="agendarSearch"
            >
              Agendar
        </button>
          </div>
        ))}
    </>
  );
  }
  