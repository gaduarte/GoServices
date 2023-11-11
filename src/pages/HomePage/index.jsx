import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { appF } from "../../backend/Firebase/firebase";
import './css/style.css';

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
  const history = useNavigate(); 

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


  return (
    <main>
      <h1 style={{color: "whitesmoke"}}>Lista de Serviços:</h1>
      <div className="container" style={{display: "flex", flexWrap: "wrap", position: "relative", margin: 0}}>
      {servicos.map((servico) => (
        <div
          className="card-container"
          key={servico.id}
        >
          
          <img src={servico.data.img} alt={servico.data.nome}
          style={{
            width: "100%",
            height: "100px",
            marginBottom: "-20px"
          }}/>

          <div className="card-body" style={{flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
            <div style={{marginBottom: "-10px"}}>
            <h5 className="card-title" style={{ fontSize: "24px", lineHeight: "32px", color: "#0F1111", fontWeight: "400", textRendering: "optimizeLegibility",marginBottom: "-10px" }}>
              {servico.data.nome}
            </h5>

            <p style={{fontSize: "16px", display: "flex", color: "#0F1111"}}>
              {servico.data.empresa}
            </p>
            <p className="card-description" style={{ fontSize: "16px", display: "flex", color: "#0F1111"}}>
              {servico.data.descricao}
            </p>
    
            </div>
            <div className="card-price" style={{ fontSize: "13px", top:"-.75em", color: "black", marginBottom: "-40px" }}>
            R$:{' '} 
            <span style={{fontSize: "28px", color: "#0F1111", lineHeight: "normal"}}> {getDecimal(servico.data.valor).integerPart}
            </span>
            <span style={{fontSize:"13px", top:"-.75em", color: "#0F1111"}}>.{getDecimal(servico.data.valor).decimalPart}</span>
          </div>
          
          </div>
          <div className="card-footer" style={{ textAlign: "center", marginTop: "10px", fontSize: "14px", position: "relative" }}>
          <button
            onClick={() => favoritaServico('empresaId', servico.id)}
            style={{
              border: "none",
              backgroundColor: "transparent",
              position: "relative",
              right: "10px",
              left: "40px",
              top: "13px",
              fontSize: "20px",
              color: "red",
            }}
          >
            ❤️
          </button>

          <button
              onClick={() => navigateToAgendamento(servico)}
              style={{
                backgroundColor: "#b14f28",
                border: "none",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
              }}
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

