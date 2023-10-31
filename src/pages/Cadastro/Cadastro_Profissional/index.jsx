import React, { useRef } from "react";
import { useCadastroProfissionalDispatch } from "./CadastroProfissionalContext";
import styles from "./Profissional.module.css";
import { appF } from "../../../backend/Firebase/firebase";
import { getAuth, createUserWithEmailAndPassword } from "@firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

const CadastroProfissional = () => {
  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const cpfRef = useRef(null);
  const enderecoRef = useRef(null);
  const empresaRef = useRef(null);
  const tipoServicoRef = useRef(null);
  const telefoneRef = useRef(null);
  const passwordRef = useRef(null);
  const dispatch = useCadastroProfissionalDispatch();

  let nextId = 1;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nome = nomeRef.current.value;
    const email = emailRef.current.value;
    const cpf = cpfRef.current.value;
    const endereco = enderecoRef.current.value;
    const empresa = empresaRef.current.value;
    const tipoServico = tipoServicoRef.current.value;
    const telefone = telefoneRef.current.value;
    const password = passwordRef.current.value;

    if(validateEmail(email) == false || validatePassword(password) == false){
      alert('Email ou senha Inválidos!');
      return;
    }

    if (validate_cpf(cpf) == false){
      alert('CPF inválido!');
      return;
    }

    if(
      validate_field(nome) == null ||
      validate_field(email) ==  null ||
      validate_field(cpf) == null ||
      validate_field(endereco) == null ||
      validate_field(tipoServico) == null ||
      validate_field(telefone) == null ||
      validate_field(password) ==  null
    ){
      alert('Campos obrigatórios não preenchidos');
      return;
    }

    try{
      const auth = getAuth(); 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const databaseRef = getDatabase(appF);

      const userDataProfissional = {
        email: email,
        password: password,
        username: nome,
        cpf: cpf,
        endereco: endereco,
        tipoServico: tipoServico,
        empresa: empresa,
        telefone: telefone,
        lat_login: Date.now(),
      };

      set(ref(databaseRef, 'profissional/' + user.uid), userDataProfissional);

      const newUsuarioProfissional = {
        email: email,
        username: nome,
        cpf: cpf,
        endereco: endereco,
        tipoServico: tipoServico,
        empresa: empresa,
        telefone: telefone,
        id: user.uid,
      };

      fetch("http://localhost:3000/cadastro?type=profissional", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType: "profissional",
          user: newUsuarioProfissional,
        }),
      })
      .then((response)=> response.json())
      .then((data)=>{
        alert('Usuário Cadastrado com Sucesso!');
      })
      .catch((error)=>{
        console.error("Erro ao enviar solicitação", error)
      })

    dispatch({
      type: 'added',
      id: nextId++, 
      text: `Nome: ${nome}, Email: ${email}, CPF: ${cpf}, Endereço: ${endereco}, Empresa: ${empresa}, Tipo de Serviço: : ${tipoServico}, Telefone: ${telefone}, Senha: ${password}`,
    });

    nomeRef.current.value = "";
    emailRef.current.value = "";
    cpfRef.current.value = "";
    enderecoRef.current.value = "";
    empresaRef.current.value = "";
    tipoServicoRef.current.value = "";
    telefoneRef.current.value = "";
    passwordRef.current.value = "";

  }catch(error){
    console.error(error);
    alert('Erro ao cadastrar Profissional');
  }
  };

  //Funções de Validção
  function validateEmail(email){
    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    return expression.test(email);
  }

  function validatePassword(password){
    return password.length >= 6;
  }

  function validate_cpf(cpf){
    return cpf.length == 11;
  }

  function validate_field(field){
    if (typeof field === "string") {
      return field.trim() !== "";
    }
    return false;
  }

  return (
    <div className={styles.centeredForm}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <div className={styles.inputContainer}>
            <input type="text" ref={nomeRef} className={styles.inputField} placeholder="Nome" />
          </div>
          <div className={styles.inputContainer}>
            <input type="text" ref={emailRef} className={styles.inputField} placeholder="Email" />
          </div>
        </div>
        <div className={styles.formGroup}>
          <div className={styles.inputContainer}>
            <input type="text" ref={cpfRef} className={styles.inputField} placeholder="CPF" />
          </div>
          <div className={styles.inputContainer}>
            <input type="text" ref={enderecoRef} className={styles.inputField} placeholder="Endereço" />
          </div>
        </div>
        <div className={styles.formGroup}>
          <div className={styles.inputContainer}>
            <input type="text" ref={empresaRef} className={styles.inputField} placeholder="Empresa" />
          </div>
          <div className={styles.inputContainer}>
            <input type="text" ref={tipoServicoRef} className={styles.inputField} placeholder="Tipo de Serviço" />
          </div>
        </div>
        <div className={styles.formGroup}>
          <div className={styles.inputContainer}>
            <input type="text" ref={telefoneRef} className={styles.inputField} placeholder="Telefone" />
          </div>
          <div className={styles.inputContainer}>
            <input type="text" ref={passwordRef} className={styles.inputField} placeholder="Senha" />
          </div>
        </div>
        <button type="submit" className={styles.button}>
          Cadastrar
        </button>
      </form>
    </div>
  );
};

export default CadastroProfissional;
