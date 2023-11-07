
import React, { useState, useEffect } from "react";
import {collection, getDocs, getFirestore, query} from "firebase/firestore";
import SearchBar from "./SearchBarConfig";
import { initializeApp } from 'firebase/app';

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
    const [query, setQuery] = useState("");
  
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
  
    const handleSearch = () => {
      const searchTerm = query.toLowerCase();
      const results = servicos.filter((servico) => {
        return (
          servico.data.nome.toLowerCase().includes(searchTerm) ||
          servico.data.descricao.toLowerCase().includes(searchTerm)
        );
      });
      setSearchResults(results);
    }
  
    return (
        <>
        <SearchBar onSearch={setQuery} />
        {searchResults.map((result) => (
          <div key={result.id}>
            <h2>{result.data.nome}</h2>
            <p>{result.data.descricao}</p>
          </div>
        ))}
      </>
      
    );
  }
  