import React, { useRef } from "react";
import { useCadastroEmpresaDispatch } from "./CadastroEmpresaContext";
import styles from "./Empresa.module.css";
import { appF } from "../../../backend/Firebase/firebase";
import { getAuth, createUserWithEmailAndPassword } from "@firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

const CadastroEmpresa = () => {
  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const enderecoRef = useRef(null);
  const descricaoRef = useRef(null);
  const cnpjRef = useRef(null);
  const telefoneRef = useRef(null);
  const passwordRef = useRef(null);
  const dispatch = useCadastroEmpresaDispatch();

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

    if(validate_email(email) == false || validate_pass(password) == false){
        alert('Email ou senha inválidos!');
        return;
    }

    if(validate_cnpj(cnpj) == false){
      alert('CNPJ inválido.');
      return;
    }

    if(
      validateField(nome) == false ||
      validateField(email) ==  false || 
      validateField(endereco) == false ||
      validateField(descricao == false ||
      validateField(cnpj) == false ||
      validateField(telefone) == false ||
      validateField(password) == false)
     ) {
      alert('Campos obrigatórios não foram preenchidos!');
      return;
    }

    try{
      const auth = getAuth(); 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const databaseRef = getDatabase(appF);

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

      set(ref(databaseRef, 'empresa/' + user.uid), userDataForEmpresa);

      const newUsuarioEmpresa = {
        email: email,
        username: nome,
        cnpj: cnpj,
        endereco: endereco,
        descricao: descricao,
        telefone: telefone,
        id: user.uid,
      };

      fetch("http://localhost:3000/cadastro?type=empresa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userType: "empresa",
          user: newUsuarioEmpresa,
        }),
      })
      .then((response)=> response.json())
      .then((data)=>{
        alert('Empresa Cadastrada com Sucesso!');
      })
      .catch((error)=>{
        console.error("Erro ao enviar solicitação", error)
      })

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
  }catch(error){
    console.log(error);
    alert('Erro ao cadastrar Empresa');
  }
  };

  //Funções de Validação
  function validate_email(email){
    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    return expression.test(email);
  }

  function validate_pass(password){
    return password.length >= 6;
  }

  function validate_cnpj(cnpj){
    return cnpj.length == 18;
  }

  function validateField(field) {
    if (typeof field === "string") {
      return field.trim() !== "";
    }
    return false;
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
          <input type="text" ref={descricaoRef} className={styles.inputField} placeholder="Descrição" />
        </div>
        <div className={styles.inputContainer}>
          <input type="text" ref={cnpjRef} className={styles.inputField} placeholder="CNPJ" />
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

export default CadastroEmpresa;

