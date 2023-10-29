import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { appF } from "../../../backend/Firebase/firebase";
import { getDatabase, ref, update } from "firebase/database";
import { useNavigate } from "react-router-dom";

const LoginUsuario = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("cliente"); 
  const history = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      alert("Preencha o email e senha.");
      return;
    }

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const databaseRef = getDatabase(appF);

        const user_data = {
          last_login: Date.now(),
        };

        update(ref(databaseRef, `${userType}/${user.uid}`), user_data);

        alert("Usuário logado!");
        history("/");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(`Erro de login: ${errorCode} - ${errorMessage}`);
      });
  };

  return (
    <div>
      <div>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="cliente">Cliente</option>
          <option value="empresa">Empresa</option>
          <option value="profissional">Profissional</option>
        </select>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" onClick={handleSubmit}>
          Entrar
        </button>
      </form>
    </div>
  );
};

export default LoginUsuario;

