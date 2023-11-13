import { addDoc, collection, doc, getFirestore, getDocs, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
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
  const [horario, setHorario] = useState("");
  const [servico, setServico] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [empresaInfo, setEmpresaInfo] = useState([]);
  //const { servicoId } = useParams();

  const history = useNavigate();

  const checkUserInEmpresaCollection = async (email) => {
    const userRef = collection(db, "empresa");
    const querySnapshot = await getDocs(userRef);

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      if (data.email === email) {
        return true;
      }
    }
    return false;
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
  }, []);

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

  const handleAdicionarHorario = async () => {
    if (!id || !horario || !servico) {
      console.log("Preencha todos os campos necessários.");
      return;
    }

    const horariosDisponiveisRef = collection(db, "horariosDisponiveis");
    const novoHorario = {
      horario: horario,
      servico: servico,
      empresaId: id,
    };

    try {
      await addDoc(horariosDisponiveisRef, novoHorario);
      console.log("Horário adicionado com sucesso.");
    } catch (error) {
      console.error("Erro ao adicionar horário:", error);
    }
  };


  return (
    <div className="centerdFormHorarioEmp">
      <label>Informe Horário: </label>
      <input
        type="text"
        placeholder="Horário (por exemplo, 08:00 AM)"
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
        className="inputEmpHorario"
      />
      <label> Nome do Serviço: </label>
      <input
        type="text"
        placeholder="Serviço"
        value={servico}
        onChange={(e) => setServico(e.target.value)}
        className="inputEmpHorario"
      />
      <button className="infoButtonEmp" onClick={handleAdicionarHorario}>Adicionar Horário</button>
      <button className="infoButtonEmp"><a href="/addServico">Voltar</a></button>
    </div>
  );
};
