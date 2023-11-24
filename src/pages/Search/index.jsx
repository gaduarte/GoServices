import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDocs, collection, getFirestore } from "firebase/firestore";
import { SearchT } from "./Search";
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAjWrDAR_DACdqhq2P7nfnYI4H6M0YkX50",
  authDomain: "goservices-a0bf9.firebaseapp.com",
  databaseURL: "https://goservices-a0bf9-default-rtdb.firebaseio.com",
  projectId: "goservices-a0bf9",
  storageBucket: "goservices-a0bf9.appspot.com",
  messagingSenderId: "966186778726",
  appId: "1:966186778726:web:31e6300c46c447d03cada7",
  measurementId: "G-H7L211LBSZ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Resultados = () => {
  const history = useNavigate();
  const { servicoId } = useParams();
  const [servicos, setServicos] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

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

  useEffect(() => {
    console.log("servicoId:", servicoId);
    console.log("servicos:", servicos);
  }, [servicoId, servicos]);

  const servicoEncontrado = servicos.find((servico) => servico.id === servicoId);
  console.log("servicoEncontrado:", servicoEncontrado);

  return (
    <div>
      <SearchT setSearchResults={setSearchResults} />
      {(searchResults.length > 0 ? searchResults : servicos).map((result) => (
        <div key={result.id} onClick={() => history(`/detalhes/${result.id}`)}>
          <h2>{result.data.nome}</h2>
          <p>{result.data.descricao}</p>
        </div>
      ))}
      {servicoEncontrado && (
        <div>
          <h2>{servicoEncontrado.data.nome}</h2>
          <p>{servicoEncontrado.data.descricao}</p>
          <p>{servicoEncontrado.data.valor}</p>
        </div>
      )}
    </div>
  );
};

export default Resultados;


