import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {  ref, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { collection,  getDocs, getFirestore, where, query } from "firebase/firestore";

const LoginEmpresa = ({onLogin}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const history = useNavigate();
    const [id, setId] = useState(null);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Função para verificar se o usuário existe na coleção 'empresa'
    const checkUserInEmpresaCollection = async(email) => {
      const db = getFirestore();
      const userRef = collection(db, "empresa");
      const q = query(userRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    };

    //Função para lidar com o login
    const handleLogin = async (email, password) => {
      try{
        const userExistsInEmpresaCollection = await checkUserInEmpresaCollection(email);

        if(!userExistsInEmpresaCollection){
          setErrorMessage("Erro de login: Usuário não encontrado na coleção 'empresa'.");
          return;
        }

        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;

        const db = getFirestore();
        const user_data = {
          last_login: Date.now(),
        };
        update(ref(db, `empresa/${uid}`), user_data);

        setId(uid);

        setSuccessMessage("Usuário empresa logado!");

        history("/empresa");
        onLogin("empresa")
      }catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
  
        
        setId(null);
        setErrorMessage(`Erro de login: ${errorCode} - ${errorMessage}`);
      }
    };
  
    const handleSubmit = async(event) => {
      event.preventDefault();

      if (!email || !password) {
        setErrorMessage("Preencha o email e senha.");
        return;
      }

      handleLogin(email, password);
    };

    return (
        <div className={styles.centeredForm}>
           {successMessage && <div className={styles.successMessage}>   {successMessage}</div>}
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder="Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} className={styles.inputField}
              />
            </div>
            <div className={styles.inputContainer}>
              <input
                type="password"
                placeholder="Senha"
                name="password"
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
    
export default LoginEmpresa;