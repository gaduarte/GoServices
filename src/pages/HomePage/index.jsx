import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjWrDAR_DACdqhq2P7nfnYI4H6M0YkX50",
  authDomain: "goservices-a0bf9.firebaseapp.com",
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

    const auth = getAuth(app);

    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        fetchServicos();
      } else {
        setUsuario(null);
      }
    });

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

  // Função para agendar serviço
  const agendarServico = (empresaId, servicoId, dataAgendamento) => {
    if (usuario) {
      const uid = usuario.uid;

      const dadosAgendamento = {
        empresaId: empresaId,
        servicoId: servicoId,
        data: dataAgendamento,
      };

      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosAgendamento),
      };

      fetch(`http://localhost:3000/agendamento/${uid}`, config)
        .then((response) => {
          if (response.ok) {
            alert('Agendamento realizado com sucesso');
          } else {
            alert('Erro ao agendar o serviço');
          }
        })
        .catch((error) => {
          console.error("Erro ao enviar solicitação", error);
        });
    }
  }

  return (
    <main>
      <h1>Lista de Serviços:</h1>
      <div className="container" style={{display: "flex", flexWrap: "wrap", position: "relative", margin: 0}}>
      {servicos.map((servico) => (
        <div
          className="card-container"
          key={servico.id}
          style={{
            backgroundColor: "#ffc0cb",
            padding: "10px",
            margin: "10px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            width: "15%",
            height: "auto",
            display: "flex",
            flexDirection: "column"
          }}
        >
          
          <img src={'https://firebasestorage.googleapis.com/v0/b/goservices-a0bf9.appspot.com/o/limpeza.jpeg?alt=media&token=0dd0c5a2-c5f9-49f1-893b-0c26fab3d177&_gl=1*4xis0j*_ga*MTEyMjc3MDQ4Ny4xNjk3NTQyNzY3*_ga_CW55HF8NVT*MTY5ODY3NDg1MC4xOC4xLjE2OTg2NzU4NTAuNTQuMC4w} alt={servico.data.nome'} alt={servico.data.nome}
          style={{
            width: "100%",
            height: "auto",
            marginBottom: "-20px"
          }}/>

          <div className="card-body" style={{flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
            <div style={{marginBottom: "-10px"}}>
            <h5 className="card-title" style={{ fontSize: "24px", lineHeight: "32px", color: "#0F1111", fontWeight: "400", textRendering: "optimizeLegibility",marginBottom: "-10px" }}>
              {servico.data.nome}
            </h5>

            <p className="card-description" style={{ fontSize: "16px", color: "#0F1111", whiteSpace:"pre-line", textAlign: "left", textJustify: "inter-word",  textAlignLast: "left", letterSpacing: "-0.5px"}}>
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
          <div className="card-footer" style={{ textAlign: "center", marginTop: "10px", fontSize: "14px",  }}>

          <button
            onClick={() => favoritaServico('empresaId', servico.id)}
            style={{
              border: "none",
              backgroundColor: "transparent",
              position: "relative",
              right: "10px",
              left: "70px",
              fontSize: "20px",
              color: "red",
            }}
          >
            ❤️
          </button>

            <button
              onClick={() => agendarServico('empresaId',servico.id, 'dataAgendamento')}
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


