import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { appF } from "../../../../backend/Firebase/firebase";
import { getDatabase, ref, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

const LoginCliente = ({onLogin}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
  
          update(ref(databaseRef, `cliente/${user.uid}`), user_data);
  
          alert("Usuário cliente logado!");
          history("/cliente");
          onLogin("cliente");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(`Erro de login: ${errorCode} - ${errorMessage}`);
        });
    }

    return (
        <div className={styles.centeredForm}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} className={styles.inputField}
              />
            </div>
            <div className={styles.inputContainer}>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)} className={styles.inputField}
              />
            </div>
            <button type="submit" onClick={handleSubmit} className={styles.button}>
              Entrar
            </button>
          </form>
        </div>
      );
    };
    
export default LoginCliente;
    