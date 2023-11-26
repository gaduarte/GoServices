import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
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

const CartoesCliente = () => {
    const [clienteData, setClienteData] = useState(null);
    const [cartao, setCartaoCliente] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [id, setId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const history = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const clienteRef = collection(db, "cliente");

    useEffect(() => {
      async function fetchClientes() {
        try {
          setIsLoading(true);
  
          const auth = getAuth();
          const user = auth.currentUser;
          const uid = user ? user.uid : null;
  
          if (uid) {
            const clienteRef = doc(db, "cliente", uid);
  
            const docSnapshot = await getDoc(clienteRef);
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              setClienteData(data);
            }
  
            const cartaoQuerySnapshot = await getDocs(collection(clienteRef, "cartao"));
            const cartaoData = cartaoQuerySnapshot.docs.map((cartaoDoc) => ({
              id: cartaoDoc.id,
              ...cartaoDoc.data(),
            }));
  
            setCartaoCliente(cartaoData);
          }
        } catch (error) {
          console.error("Erro ao buscar os clientes:", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchClientes();
    }, [setCartaoCliente]);

      useEffect(() => {
        async function fetchCartaoCliente() {
          try {
            setIsLoading(true);
      
            if (clienteData && clienteData.id) {
              // Consulta a subcoleção "cartao" dentro do documento do cliente
              const clienteId = clienteData.id;
              const cartaoQuery = query(collection(clienteRef, clienteId, "cartao")); 
              const cartaoSnapshot = await getDocs(cartaoQuery);
      
              if (!cartaoSnapshot.empty) {
                
                const cartoes = [];
                cartaoSnapshot.forEach((doc) => {
                  cartoes.push(doc.data());
                });
                setCartaoCliente(cartoes);
              }
            }
          } catch (error) {
            console.error("Erro ao buscar os cartões do cliente:", error);
          } finally {
            setIsLoading(false);
          }
        }
        fetchCartaoCliente();
      }, [clienteData, clienteRef]);

      const handleDeleteCartao = async (cartaoId) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const uid = user ? user.uid : null;
    
            const confirmDelete = window.confirm("Tem certeza que deseja excluir cartão?");
            if (confirmDelete) {
                if (uid && cartaoId) {
                    const clienteDocRef = doc(db, "cliente", uid);
                    const cartaoRef = doc(collection(clienteDocRef, "cartao"), cartaoId);
    
                    await deleteDoc(cartaoRef);
    
                    const deleteConfig = {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    };
    
                    const response = await fetch(`http://localhost:3000/cartao/remove/1/${cartaoId}`, deleteConfig);
    
                    if (!response.ok) {
                        throw new Error("Erro na solicitação da API");
                    }
    
                    const responseData = await response.json();
                    console.log('Resposta da API:', responseData);
                    setSuccessMessage('Cartão excluído com sucesso!');
                    setErrorMessage('');
                    history("/login");
                } else {
                    console.error("IDs não definidos");
                    setErrorMessage("Erro: IDs não definidos");
                }
            }
        } catch (error) {
            console.error("Erro ao excluir cartão", error);
            setErrorMessage('Erro ao excluir cartão: ' + error.message);
        }
    };
    
    

      return (
        <>
        <h2>Seus Cartões Cadastrados: </h2>
          {cartao && cartao.map((cartaoItem) => (
            <div key={cartaoItem.id} className="containerCartao">
              <p className="cartaoCli">Número do Cartão: {cartaoItem.numero} </p> 
              <p className="cartaoCli">Nome do titular: {cartaoItem.nome} </p>
              <p className="cartaoCli">Código do Cartão: {cartaoItem.codigo} </p>
              <p className="cartaoCli">Data de Validade: {cartaoItem.dataValidade} </p>
              <Button className="buttonExcluirCartao" onClick={() => handleDeleteCartao( cartaoItem.id)}>Excluir Cartão</Button>
              <Button className="buttonVoltarCartao"><a href="/cliente">Voltar</a></Button>
            </div>
          ))}
        </>
      );
      
      
}

export default CartoesCliente;