import React, { useRef , useState} from "react";
import { useCadastroProfissionalDispatch } from "./CadastroProfissionalContext";
import styles from "./Profissional.module.css";
import { getAuth, createUserWithEmailAndPassword } from "@firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

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

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage('Email ou senha Inválidos!');
      return;
    }

    if (validate_cpf(cpf) == false){
      setErrorMessage('CPF inválido!');
      return;
    }

    if(
      !validate_field(nome) ||
      !validate_field(email) ||
      !validate_field(cpf) ||
      !validate_field(endereco) ||
      !validate_field(tipoServico)  ||
      !validate_field(telefone)  ||
      !validate_field(password) 
    ){
      setErrorMessage('Campos obrigatórios não preenchidos');
      return;
    }

    try{
      const auth = getAuth(); 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;

      const db = getFirestore();

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

      const profissionalRef = doc(db, "profissional", uid);

      try{
        await setDoc(profissionalRef, userDataProfissional);

      const newUsuarioProfissional = {
        type: "profissional",
        email: email,
        username: nome,
        cpf: cpf,
        endereco: endereco,
        tipoServico: tipoServico,
        empresa: empresa,
        telefone: telefone,
        id: uid,
      };

      const configUsuarioProfissional = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUsuarioProfissional),
      }

      await fetch("http://localhost:3000/cadastro/profissional", configUsuarioProfissional)
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
    setErrorMessage('Erro ao cadastrar usuário');
    setSuccessMessage('');
  }
}catch(error){
  console.error(error);
  setErrorMessage('Erro ao criar usuário no Firebase Authentication');
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
    return field !== null && field.trim() !== "";
  }

  return (
    <div className={styles.centeredForm}>
      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
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
