import React, { useRef } from "react";
import { useCadastroDispatch } from "./CadastroClienteContext";
import styles from "./Cliente.module.css";
import { appF } from "../../../backend/Firebase/firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

const CadastroCliente = () => {
  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const enderecoRef = useRef(null);
  const cpfRef = useRef(null);
  const telefoneRef = useRef(null);
  const passwordRef = useRef(null);
  const dispatch = useCadastroDispatch();

  let nextId = 1;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nome = nomeRef.current.value;
    const email = emailRef.current.value;
    const endereco = enderecoRef.current.value;
    const cpf = cpfRef.current.value;
    const telefone = telefoneRef.current.value;
    const password = passwordRef.current.value;

    if (validateEmail(email) === false || validatePassword(password) === false) {
      alert('Email ou senha inválidos!');
      return;
    }

    if (
      validateField(nome) === false ||
      validateField(cpf) === false ||
      validateField(endereco) === false ||
      validateField(telefone) === false ||
      validateField(email) === false ||
      validateField(password) === false
    ) {
      alert('Campos obrigatórios não foram preenchidos!');
      return;
    }

    try {
      const auth = getAuth(); 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const databaseRef = getDatabase(appF);

      const userData = {
        email: email,
        password: password,
        username: nome,
        cpf: cpf,
        endereco: endereco,
        telefone: telefone,
        last_login: Date.now(),
      };

      set(ref(databaseRef, 'cliente/' + user.uid), userData);

      const newUsuario = {
        email: email,
        username: nome,
        cpf: cpf,
        endereco: endereco,
        telefone: telefone,
        id: user.uid,
      };

      const configUsuario = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType: "cliente",
          user: newUsuario,
        }),
      }

      fetch("http://localhost:3000/cadastro?type=cliente", configUsuario)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro na solicitação da API");
          }
          return response.json();
        })
        .then((data) => {
          alert('Usuário Cadastrado com Sucesso!');
        })
        .catch((error) => {
          console.error("Erro ao enviar solicitação", error);
        });


      dispatch({
        type: "added",
        id: nextId++, 
        text: `Nome: ${nome}, Email: ${email}, Endereço: ${endereco}, CPF: ${cpf}, Telefone: ${telefone}, Senha: ${password}`,
      });


      nomeRef.current.value = "";
      emailRef.current.value = "";
      enderecoRef.current.value = "";
      cpfRef.current.value = "";
      telefoneRef.current.value = "";
    } catch (error) {
      console.error(error);
      alert('Erro no cadastro.');
    }
  };

  // Funções de validação
  function validateEmail(email) {
    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    return expression.test(email);
  }

  function validatePassword(password) {
    return password.length >= 6;
  }

  function validateField(field) {
    return field !== null && field.trim() !== "";
  }

  return (
    <div className={styles.centeredForm}>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputContainer}>
          <input type="text" ref={nomeRef} className={styles.inputField} placeholder="Nome" />
        </div>
        <div className={styles.inputContainer}>
          <input type="text" ref={emailRef} className={styles.inputField} placeholder="Email" />
        </div>
        <div className={styles.inputContainer}>
          <input type="text" ref={enderecoRef} className={styles.inputField} placeholder="Endereço" />
        </div>
        <div className={styles.inputContainer}>
          <input type="text" ref={cpfRef} className={styles.inputField} placeholder="Cpf" />
        </div>
        <div className={styles.inputContainer}>
          <input type="text" ref={telefoneRef} className={styles.inputField} placeholder="Telefone" />
        </div>
        <div className={styles.inputContainer}>
          <input type="password" ref={passwordRef} className={styles.inputField} placeholder="Senha" />
        </div>

        <button type="submit" className={styles.button}>
          Cadastrar
        </button>
      </form>
    </div>
  );
};

export default CadastroCliente;
