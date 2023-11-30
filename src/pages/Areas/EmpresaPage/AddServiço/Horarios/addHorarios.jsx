import { addDoc, collection, doc, getFirestore, getDocs, getDoc, where, query } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


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
  const { servicoId } = useParams();
  const [servicoData, setServicoData] = useState(null);
  const [id, setId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [empresaInfo, setEmpresaInfo] = useState([]);
  const [currentServicoId, setCurrentServicoId] = useState(servicoId);
  
  const servicoRef = collection(db, "servico");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const fetchServico = async () => {
    try {
      const querySnapshot = await getDocs(servicoRef);
      querySnapshot.forEach((doc) => {
        if (doc.id === currentServicoId) {
          setServicoData(doc.data());
        }
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar Serviço", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentServicoId) {
      fetchServico();
    }
  }, [currentServicoId]);
  
  const handleAdicionarHorario = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const uid = user ? user.uid : null;
  
      if (!selectedDate) {
        setErrorMessage('Selecione uma data e hora válidas.');
        return;
      }
  
      const formattedDate = format(selectedDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss 'UTC'XXX", {
        locale: ptBR,
        timeZone: 'America/Sao_Paulo',
      });
  
      const horariosDisponiveisRef = collection(db, 'horariosDisponiveis');
  
      const novoHorario = {
        horario: selectedDate,
        servico: currentServicoId,
        empresaId: uid,
        status: false,
      };
  
      try {
        const docRef = await addDoc(horariosDisponiveisRef, novoHorario);
        console.log("Horário adicionado ao Firestore com sucesso. Documento ID:", docRef.id);
      } catch (error) {
        console.error("Erro ao adicionar horário ao Firestore:", error);
        setErrorMessage('Erro ao cadastrar horário. Tente novamente mais tarde.');
        return;
      }
  
      const configHorario = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...novoHorario,
          horario: formattedDate,
        }),
      };
  
      const response = await fetch('http://localhost:3000/addHorario', configHorario);
  
      if (!response.ok) {
        throw new Error('Erro na solicitação da API');
      }
  
      const responseData = await response.json();
      console.log('Resposta da API:', responseData);
  
      setSuccessMessage('Serviço cadastrado com sucesso!');
      setErrorMessage('');
    } catch (error) {
      console.error('Erro ao adicionar horário:', error);
      setErrorMessage('Erro ao cadastrar horário. Tente novamente mais tarde.');
    }
  };
  
  return (
    <div className="centeredFormHorarioEmp">
      <label className="h3H">Data e Hora:</label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Hora"
        dateFormat="dd/MM/yyyy HH:mm aa"
        placeholderText="Selecione a data e hora"
        className="inputEmpHorario"
      />
      <p>
        {servicoData && (
          <h3 className="h3H">
             Serviço: {servicoData.nome}, ID: {currentServicoId}
          </h3>
        )}
      </p>
  
      <div className="buttonContainer">
      <button className="infoButtonEmp" onClick={handleAdicionarHorario}>
        Adicionar
      </button>
      <div className="messageContainer">
        {successMessage && <div className="successMessage">{successMessage}</div>}
        {errorMessage && <div className="errorMessage">{errorMessage}</div>}
      </div>
      <button className="infoButtonEmp">
        <a href="/addServico">Voltar</a>
      </button>
    </div>

    </div>
  );
  
};
