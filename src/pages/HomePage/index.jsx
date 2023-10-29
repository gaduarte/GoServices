import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { appF, auth } from "../../backend/Firebase/firebase";
import {getAuth, onAuthStateChanged } from "firebase/auth";

export function HomePage() {
  const [servicos, setServicos] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function fetchServicos() {
      try {
        const querySnapshot = await getDocs(collection(appF, "servico"));
        const servicoData = [];
        querySnapshot.forEach((doc) => {
          servicoData.push({ id: doc.id, data: doc.data() });
        });
        setServicos(servicoData);
      } catch (error) {
        console.error("Erro ao buscar os serviços:", error);
      }
    }

    const auth = getAuth(appF);

    onAuthStateChanged(auth, (user)=>{
      if(user){
        setUsuario(user);
        fetchServicos();
      }else{
        setUsuario(null);
      }
    })
  }, []);

  return (
    <main>
      <h1>Lista de Serviços:</h1>
      <ul>
        {servicos.map((servico) => (
          <li key={servico.id}>{servico.data.nome}</li>
        ))}
      </ul>
    </main>
  );
}
