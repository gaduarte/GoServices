import React, { useEffect, useState } from "react";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { appF } from "../../../backend/Firebase/firebase";
import './css/MaisAgendados.css';

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

const MaisAgendados = () => {
    const [servicos, setServicos] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const [servicosMaisAgendados, setServicosMaisAgendados] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const history = useNavigate();

    useEffect(() => {
        const unsubscribeServicos = onSnapshot(collection(db, "servico"), (snapshot) => {
            const servicoData = snapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data()
            }));
            setServicos(servicoData);
        });

        const unsubscribeAgendamentos = onSnapshot(collection(db, "agendamento"), (snapshot) => {
            const agendamentoData = snapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data()
            }));
            setAgendamentos(agendamentoData);
        });

        return () => {
            unsubscribeServicos();
            unsubscribeAgendamentos();
        };
    }, [db]);

    useEffect(() => {
        const agendamentoPorServico = {};

        agendamentos.forEach((agendamento) => {
            const servicoId = agendamento.data.servicoId;

            if (agendamentoPorServico[servicoId]) {
                agendamentoPorServico[servicoId]++;
            } else {
                agendamentoPorServico[servicoId] = 1;
            }
        });

        // Filtra apenas os serviços que têm agendamentos
        const servicosComAgendamentos = servicos.filter((servico) => agendamentoPorServico[servico.id]);

        // Ordena os serviços com base na contagem de agendamentos
        const servicosMaisAgendados = servicosComAgendamentos
            .sort((a, b) => agendamentoPorServico[b.id] - agendamentoPorServico[a.id])
            .map((servico) => ({
                ...servico,
                contagem: agendamentoPorServico[servico.id]
            }));

        setServicosMaisAgendados(servicosMaisAgendados);
        setIsLoading(false);

    }, [agendamentos, servicos]);

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

      return (
        <>
          <div className="mais-populares-container">
            <h2 className="mais-populares-title">Serviços mais Agendados: </h2>
            {servicosMaisAgendados.map((servico) => (
              <div key={servico.id} className="mais-populares-item">
                <img src={servico.data.img} alt={servico.data.nome} className="mais-populares-img" />
                <div className="mais-populares-details">
                  <h5 className="mais-populares-nome">{servico.data.nome}</h5>
                  <p className="mais-populares-empresa">{servico.data.empresa}</p>
                  <p className="mais-populares-descricao">{servico.data.descricao}</p>
                </div>
                <div className="mais-populares-preco">
                  R$: <span className="mais-populares-valor">
                    {getDecimal(servico.data.valor).integerPart}
                  </span>
                  <span className="mais-populares-decimal">
                    .{getDecimal(servico.data.valor).decimalPart}
                  </span>
                </div>
                <div className="mais-populares-buttons">
                  <button
                    onClick={() => navigateToFavoritos(servico)}
                    className="mais-populares-favorito-button"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => navigateToAgendamento(servico)}
                    className="mais-populares-agendar-button"
                  >
                    Agende agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      );      
}

export default MaisAgendados;