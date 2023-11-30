import React, { useRef, useState } from "react";
import { useCadastroEmpresaDispatch } from "./CadastroEmpresaContext";
import "./css/Empresa.css";
import { appF } from "../../../backend/Firebase/firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const CadastroEmpresa = () => {
  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const enderecoRef = useRef(null);
  const descricaoRef = useRef(null);
  const cnpjRef = useRef(null);
  const telefoneRef = useRef(null);
  const passwordRef = useRef(null);
  const dispatch = useCadastroEmpresaDispatch();

  const history = useNavigate();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  let nextId = 1;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nome = nomeRef.current.value;
    const email = emailRef.current.value;
    const endereco = enderecoRef.current.value;
    const descricao = descricaoRef.current.value;
    const cnpj = cnpjRef.current.value;
    const telefone = telefoneRef.current.value;
    const password = passwordRef.current.value;

    if (validateEmail(email) === false || validatePassword(password) === false) {
      setErrorMessage('Email ou senha inválidos!');
      return;
    }

    if (!validateCnpj(cnpj)) {
      setErrorMessage('CNPJ inválido.');
      return;
    }

    if (
      !validateField(nome) ||
      !validateField(cnpj) ||
      !validateField(descricao) ||
      !validateField(endereco) ||
      !validateField(telefone) ||
      !validateField(email) ||
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

      const userDataForEmpresa = {
        email: email,
        password: password,
        username: nome,
        endereco: endereco,
        descricao: descricao,
        cnpj: cnpj,
        telefone: telefone,
        last_login: Date.now(),
      };

      const empresaRef = doc(db, "empresa", uid);

      try {
        await setDoc(empresaRef, userDataForEmpresa);

        const newUsuarioEmpresa = {
          type: "empresa",
          email: email,
          username: nome,
          cnpj: cnpj,
          endereco: endereco,
          descricao: descricao,
          telefone: telefone,
          id: uid,
        };

        const configUsuarioEmpresa = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUsuarioEmpresa),
        };

        await fetch("http://localhost:3000/cadastro/empresa", configUsuarioEmpresa)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Erro na solicitação da API");
            }
            return response.json();
          })
          .then((response) => response.json())
          .then((data) => {
            setSuccessMessage('Usuário cadastrado com sucesso!');
            setErrorMessage('');
          })
          .catch((error) => {
            console.error("Erro ao enviar solicitação", error);
          });

        dispatch({
          type: 'added',
          id: nextId++,
          text: `Nome: ${nome}, Email: ${email}, Endereço: ${endereco}, Descrição: ${descricao}, CNPJ: ${cnpj}, Telefone: ${telefone}, Senha: ${password}`,
        });

        nomeRef.current.value = "";
        emailRef.current.value = "";
        enderecoRef.current.value = "";
        descricaoRef.current.value = "";
        cnpjRef.current.value = "";
        telefoneRef.current.value = "";
        passwordRef.current.value = "";

        console.log("Tentando redirecionar para /login");
        history("/");
      } catch (error) {
        console.error(error);
        setErrorMessage('Erro ao cadastrar usuário');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Erro ao criar empresa no Firebase Authentication');
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

  function validateCnpj(cnpj) {
    return cnpj.length <= 18;
  }

  function validateField(field) {
    return field !== null && field.trim() !== "";
  }

  return (
    <div className="centeredFormEmp">
      {successMessage && <div className="successMessageEmp">{successMessage}</div>}
      {errorMessage && <div className="errorMessageEmp">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="inputContainerEmp">
          <input type="text" ref={nomeRef} className="inputFieldEmp" name="nome" placeholder="Nome" />
        </div>
        <div className="inputContainerEmp">
          <input type="text" ref={emailRef} className="inputFieldEmp" name="email" placeholder="Email" />
        </div>
        <div className="inputContainerEmp">
          <input type="text" ref={enderecoRef} className="inputFieldEmp" name="endereco" placeholder="Endereço" />
        </div>
        <div className="inputContainerEmp">
          <input type="text" ref={descricaoRef} className="inputFieldEmp" name="descricao" placeholder="Descrição" />
        </div>
        <div className="inputContainerEmp">
          <input type="text" ref={cnpjRef} className="inputFieldEmp" name="cnpj" placeholder="CNPJ" />
        </div>
        <div className="inputContainerEmp">
          <input type="text" ref={telefoneRef} className="inputFieldEmp" name="telefone" placeholder="Telefone" />
        </div>
        <div className="inputContainerEmp">
          <input type="password" ref={passwordRef} className="inputFieldEmp" name="password" placeholder="Senha" />
        </div>
        <button type="submit" className="buttonEmp" style={{color: "white"}}>
          Cadastrar
        </button>
        <button className="buttonEmp"><a href="/">Cancelar</a></button>
      </form>
    </div>
  );
  
};

export default CadastroEmpresa;


