import React, { useState } from "react";
import LoginCliente from "./LoginCliente";
import LoginEmpresa from "./LoginEmpresa";
import LoginProfissional from "./LoginProfissional";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import './css/selectLogin.css';

const LoginUsuario = () => {
  const [opcao, setOpcao] = useState("cliente");

  const handleChangeOpcao = (event) => {
    setOpcao(event.target.value);
  };

  const checkUserType= async (userEmail) =>{
    try{
      const auth = getAuth();
      const user = auth.currentUser;

      if(user){
        const databaseRef = getDatabase();
        const userTypeRef = ref(databaseRef, `cliente/${user.uid}`);

        const snapshot = await get(userTypeRef);

        if(snapshot.exists()){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    } catch(error){
      console.error("Erro ao verificar tipo de usuário", error);
      return false;
    }
  }

  const handleLogin = async (userType, email) => {
    const userTypeByEmail = await checkUserType(email);

    if(userTypeByEmail === "cliente" && userType === "cliente"){

    }else if(userTypeByEmail === "empresa" && userType === "empresa"){

    }else if(userTypeByEmail === "profissional" && userType === "profissional"){

    };

  };

  return (
    <div style={{margin: "10px 0"}}>
      <select className="selec" value={opcao} onChange={handleChangeOpcao}>
        <option value="cliente">Cliente</option>
        <option value="empresa">Empresa</option>
        <option value="profissional">Profissional</option>
      </select>

      {opcao === "cliente" && <LoginCliente onLogin={()=> handleLogin("cliente")}/>}
      {opcao === "empresa" && <LoginEmpresa onLogin={()=> handleLogin("empresa")} />}
      {opcao === "profissional" && <LoginProfissional onLogin={()=> handleLogin("profissional")} />}
    </div>
  );
};

export default LoginUsuario;

