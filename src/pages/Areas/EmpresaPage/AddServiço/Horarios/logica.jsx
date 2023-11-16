import { addDoc, collection, doc, getDoc, getDocs, query, where, getFirestore, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import WorkingScheduleComponent from "./addHorarios";
import { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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

export const AdicionarHorarioDisponivel = () => {
  const [id, setId] = useState(null);
  const [empresaInfo, setEmpresaInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const history = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [horariosSelecionados, setHorariosSelecionados] = useState([]);
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  const servicoRef = useRef(null);

  const checkUserInEmpresaCollection = async (email) => {
    const userRef = collection(db, "empresa");
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  useEffect(() => {
    const auth = getAuth();

    auth.onAuthStateChanged(async function (user) {
      if (user) {
        const id = user.uid;
        setId(id);
      } else {
        history("/login");
      }
      setIsLoading(false);
    });

    const checkUserRole = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          history("/login");
        } else {
          const isEmpresa = await checkUserInEmpresaCollection(user.email);

          if (!isEmpresa) {
            history("/login");
          } else {
            sessionStorage.setItem("role", "empresa");
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar a função do usuário: ", error);
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [history]);

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        setIsLoading(true);

        const auth = getAuth();
        const user = auth.currentUser;
        const uid = user ? user.uid : null;

        if (uid) {
          const empresaDocRef = doc(db, "empresa", uid);

          const docSnapshot = await getDoc(empresaDocRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            console.log("Dados da empresa: ", data);
            setEmpresaInfo(data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao buscar informações: ", error);
        setIsLoading(false);
      }
    }
    fetchEmpresa();
  }, []);

  const handleHorariosSelecionados = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user ? user.uid : null;

    if (uid) {
      try {
        const horariosCollectionRef = collection(db, "horariosDisponiveis");
        
        for (const horario of horariosSelecionados) {
          for (const dia of diasSelecionados) {
            const novoHorario = {
              horario: horario.date.toISOString(),
              dia: dia,
              empresaId: uid,
              servicoId: servicoRef.current.value,
            };

            await addDoc(horariosCollectionRef, novoHorario);
          }
        }
        
        setSuccessMessage('Horários cadastrados com sucesso!');
        setErrorMessage('');
      } catch (error) {
        console.error("Erro ao adicionar horários", error);
        setErrorMessage("Erro ao adicionar horários: " + error.message);
      }
    }
  };

  return (
    <div>
     
    </div>
  );
};

export default AdicionarHorarioDisponivel;
