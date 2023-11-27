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
            const empresaIncludesTerm = servico.data.empresa.toLowerCase().includes(searchTerm);
            return nomeIncludesTerm || descricaoIncludesTerm || empresaIncludesTerm;
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
    <div className="search-container">
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
        className="search-input"
      />
      <button onClick={handleSearch} className="search-button">
        <FaSearch size={12} />
      </button>
      {searchResults.map((result) => (
        <div key={result.id} className="search-result-container">
          <img src={result.data.img} alt={result.data.nome} className="search-result-img" />
          <div className="search-result-card">
            <h2>{result.data.nome}</h2>
            <p>{result.data.descricao}</p>
            <div className="search-result-valor">
              <p>Valor: {result.data.valor}</p>
            </div>
            <button onClick={() => navigateToAgendamento(result)} className="search-result-agendar">
              Agendar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
  }
  