import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col, Card, Button } from  "react-bootstrap";
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

const FavoritosCliente = () => {
  const [id, setId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clienteInfo, setClienteInfo] = useState([]);
  const [servicoData, setServicoData] = useState([]);
  const [favoritoData, setFavoritoData] = useState([]);
  const [favoritoInfo, setFavoritoInfo] = useState([]);
  const history = useNavigate();

  const checkUserInClienteCollection = async (email) => {
    const db = getFirestore();
    const usersRef = collection(db, "cliente");
    const q = query(usersRef, where("email", "==", email));
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
  }, [history]);


const checkUserRole = async () => {
    try{
        const auth = getAuth();
        const user = auth.currentUser;

        if(!user){
            history("/login");
        }else {
            const isCliente = await checkUserInClienteCollection(user.email);

            if(!isCliente){
                history("/login");
            }else {
                sessionStorage.setItem("role", "cliente");
                setIsLoading(false);
            }
        }
    }catch (error) {
        console.error("Erro ao verificar a função do usuário: ", error);
        setIsLoading(false);
      }
}

useEffect(()=>{
    checkUserRole();
}, [history]);

useEffect(()=>{
  async function fetchClienteFavoritos(){
    try{
      setIsLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      const uid = user ? user.uid : null;

      const favoritoDoc = query(collection(db, "favorito"), where("clienteId", "==", uid));
      const querySnapshot = await getDocs(favoritoDoc);
      const favoritoInfo = [];

      for(const docSnapshot of querySnapshot.docs){
        const favoritoData = docSnapshot.data();

        const servicoId = favoritoData.servicoId;
        const servicoDocRef = doc(db, "servico", servicoId);
        const servicoDocSnapshot = await getDoc(servicoDocRef);

        const [servicoData] = await Promise.all([
          servicoDocSnapshot.exists() ? servicoDocSnapshot.data() : null
        ]);

        favoritoInfo.push({
          id: docSnapshot.id,
          ...favoritoData,
          servico: servicoData
        });
      }

      setFavoritoInfo(favoritoInfo);
      setIsLoading(false);
    }catch (error) {
      console.error("Erro ao buscar informações: ", error);
      setIsLoading(false);
  }
  }

  fetchClienteFavoritos();
}, [db]);


useEffect(()=>{
  async function fetchCliente(){
      try{
          setIsLoading(true);

          const auth = getAuth();
          const user = auth.currentUser;
          const uid = user ? user.uid : null;

          if(uid){
              const clienteDocRef = doc(db, "cliente", uid);

              const docSnapshot = await getDoc(clienteDocRef);

              if(docSnapshot.exists()){
                  const data = docSnapshot.data();
                  setClienteInfo(data);
              }
              setIsLoading(false);
          }
          }catch(error) {
              console.error("Erro ao buscar informações: ", error);
              setIsLoading(false);
          }
  }
  fetchCliente();
}, []);

function getDecimal(value){
  const stringValue = value.toString();
  let [integerPart, decimalPart] = stringValue.split('.');

  if (decimalPart === undefined) {
  decimalPart = '00';
} else if (decimalPart.length === 1) {
  decimalPart += '0';
}

  return {
    integerPart,
    decimalPart,
};
}

return (
  <Container className="main">
    <h2>Meus Favoritos</h2>
    {isLoading ? (
      <p>Carregando...</p>
    ) : (
      <div className="containerFavs">
        {favoritoInfo.map((favorito) => (
          <Card key={favorito.id} className="card">
            <Card.Body className="card-bodys">
              <Row className="rowFavs">
                {favorito.servico && (
                  <Col>
                    <h5 className="card-title-fav">{favorito.servico.nome}</h5>
                    <p style={{ fontSize: "15px", display: "flex", color: "#0F1111", textAlign: "left" }}>
                      {favorito.servico.empresa}
                    </p>
                    <p className="card-description-fav">{favorito.servico.descricao}</p>
                    <div className="card-price">
                      R$:{' '}
                      <span style={{ fontSize: "28px", color: "#0F1111" }}>
                        {getDecimal(favorito.servico.valor).integerPart}
                      </span>
                      <span style={{ fontSize: "13px", top: "-.75em", color: "#0F1111" }}>
                        .{getDecimal(favorito.servico.valor).decimalPart}
                      </span>
                      <div>
                        <button>Remover</button>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        ))}
        <button className="buttonFav1"><a href="/">Voltar</a></button>
      </div>
    )}
  </Container>
);


}

export default FavoritosCliente;