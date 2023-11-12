import React, { useRef , useState, useEffect} from "react";
import { useCadastroProfissionalDispatch } from "./CadastroProfissionalContext";
import styles from "./Profissional.module.css";
import { getAuth, createUserWithEmailAndPassword } from "@firebase/auth";
import { collection, doc, getDocs, getFirestore, setDoc } from "firebase/firestore";
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAjWrDAR_DACdqhq2P7nfnYI4H6M0YkX50",
  authDomain: "goservices-a0bf9.firebaseapp.com",
  databaseURL: "https://goservices-a0bf9-default-rtdb.firebaseio.com",
  projectId: "goservices-a0bf9",
  storageBucket: "goservices-a0bf9.appspot.com",
  messagingSenderId: "966186778726",
  appId: "1:966186778726:web:31e6300c46c447d03cada7",
  measurementId: "G-H7L211LBSZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CadastroProfissional = () => {
  const [empresa, setEmpresa] = useState(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const cpfRef = useRef(null);
  const enderecoRef = useRef(null);
  const empresaRef = collection(db, "empresa");
  const tipoServicoRef = useRef(null);
  const telefoneRef = useRef(null);
  const passwordRef = useRef(null);
  const dispatch = useCadastroProfissionalDispatch();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  let nextId = 1;

  
  useEffect(() => {
    async function fetchEmpresa() {
      try {
        setIsLoading(true);
        const empresaQuerySnapshot = await getDocs(empresaRef);
        const empresasData = [];
  
        empresaQuerySnapshot.forEach((doc) => {
          empresasData.push({
            id: doc.id,
            ...doc.data(),
          });
        });
  
        setEmpresa(empresasData);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar informações de horários disponíveis: ", error);
        setIsLoading(false);
      }
    }
  
    fetchEmpresa();
  }, []); 

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nome = nomeRef.current.value;
    const email = emailRef.current.value;
    const cpf = cpfRef.current.value;
    const endereco = enderecoRef.current.value;
    const empresa = selectedEmpresa;
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
    return cpf.length == 14;
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
          <div className={styles.formGroup}>
          <div className={styles.inputContainer}>
          <select  
            className="select-empresa"
            value={selectedEmpresa}
            onChange={(e) => setSelectedEmpresa(e.target.value)}
          >
            <option value="">Selecione Empresa</option>
            {empresa && empresa.map((empresa, index) => (
              <option key={index} value={empresa.id}>
                {empresa.username}
              </option>
            ))}
          </select>
          </div>
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
