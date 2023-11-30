import React, { useRef, useState } from "react";
import { useCadastroDispatch } from "./CadastroClienteContext";
import "./css/Cliente.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const CadastroCliente = () => {
  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const enderecoRef = useRef(null);
  const cpfRef = useRef(null);
  const telefoneRef = useRef(null);
  const passwordRef = useRef(null);
  const dispatch = useCadastroDispatch();

  const history = useNavigate();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage('Email ou senha inválidos!');
      return;
    }

    if (
      !validateField(nome) ||
      !validateField(cpf) ||
      !validateField(endereco) ||
      !validateField(telefone)  ||
      !validateField(email)  ||
      !validateField(password) 
    ) {
      setErrorMessage('Campos obrigatórios não foram preenchidos!');
      return;
    }

    try {
      const auth = getAuth(); 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;

      const db = getFirestore();

      const userData = {
        email: email,
        password: password,
        username: nome,
        cpf: cpf,
        endereco: endereco,
        telefone: telefone,
        last_login: Date.now(),
      };

      const userDocRef = doc(db, "cliente", uid);

      try {
        await setDoc(userDocRef, userData);

        const newUsuario = {
          type: "cliente",
          username: nome,
          email: email,
          endereco: endereco,
          cpf: cpf,
          telefone: telefone,
          id: uid,
        };

        const configUsuario = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUsuario),
        };

        await fetch("http://localhost:3000/cadastro/cliente", configUsuario)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Erro na solicitação da API");
            }
            return response.json();
          }).then((response)=> response.json())
          .then((data)=>{
            setSuccessMessage('Usuário cadastrado com sucesso!');
            setErrorMessage('');
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

        console.log("Tentando redirecionar para /login");
        history("/login");
      } catch (error) {
        console.error(error);
        setErrorMessage('Erro ao cadastrar usuário');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Erro ao criar usuário no Firebase Authentication');
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
    <div className="centeredFormCli">
      {successMessage && <div className="successMessageCli">{successMessage}</div>}
      {errorMessage && <div className="errorMessageCli">{errorMessage}</div>}
      <form onSubmit={handleSubmit} className="cadastroFormCli">
        <div className="inputContainerCli">
          <input type="text" ref={nomeRef} className="inputFieldCli" name="nome" placeholder="Nome" />
        </div>
        <div className="inputContainerCli">
          <input type="text" ref={emailRef} className="inputFieldCli" name="email" placeholder="Email" />
        </div>
        <div className="inputContainerCli">
          <input type="text" ref={enderecoRef} className="inputFieldCli" name="endereco" placeholder="Endereço" />
        </div>
        <div className="inputContainerCli">
          <input type="text" ref={cpfRef} className="inputFieldCli" name="cpf" placeholder="Cpf" />
        </div>
        <div className="inputContainerCli">
          <input type="text" ref={telefoneRef} className="inputFieldCli" placeholder="Telefone" />
        </div>
        <div className="inputContainerCli">
          <input type="password" ref={passwordRef} className="inputFieldCli" placeholder="Senha" />
        </div>

        <button type="submit" className="buttonCli">
          Cadastrar
        </button>
        <button className="buttonCli" onClick={() => navigate("/")}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default CadastroCliente;

