import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, setDoc, query , where} from "firebase/firestore";
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

const ProfissionalDashboard = () => {
    const [editMode, setEditMode] = useState(false);
    const [profissionalInfo, setProfissionalInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const[id, setId] = useState(null);
    const history = useNavigate();

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const checkUserInProfissionalCollection = async (email) => {
        const db = getFirestore();
        const userRef = collection(db, "profissional");
        const q = query(userRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };

    useEffect(()=>{
        const auth = getAuth();

        auth.onAuthStateChanged(async function (user){
            if(user){
                const id = user.uid;
                setId(id);
            }else{
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
            }else{
                const isProfissional = await checkUserInProfissionalCollection(user.email);

                if(!isProfissional){
                    history("/login");
                }else{
                    sessionStorage.setItem("role", "profissional");
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

    const handleEditClick = () => {
        setEditMode(true);
    }

    const handleSaveClick = async()=>{
        try{
            const profissionalDocRef = doc(db, "profissional", id);

            await setDoc(profissionalDocRef, profissionalInfo, {merge: true});

            const response = await fetch(`http://localhost:3000/profissional/1/${id}`);

            if(!response.ok){
                throw new Error("Erro na solicitação da API");
            }
            const data = await response.json();
            setEmpresaInfo(data);
            setSuccessMessage('Dados encontrados com sucesso!');
            setErrorMessage('');
            setEditMode(false);
        }catch(error){
            console.error("Erro ao salvar informações", error);
            setErrorMessage('Erro ao salvar informações: ' + error.message);
        }
        setEditMode(false);
    }

    const handleCancelClick = () => {
        setEditMode(false);
    }

    useEffect(()=>{
        async function fetchProfissional(){
            try{
                setIsLoading(true);
                const querySnapshot = await getDocs(collection(db, "profissional"));
                const profissionalData = [];

                querySnapshot.forEach((doc)=>{
                    profissionalData.push({id:doc.id, data: doc.data()});
                });

                if(profissionalData.length > 0){
                    setProfissionalInfo(profissionalData[0].data);
                }

                setIsLoading(false);
            }catch(error){
                console.error("Erro ao buscar informações: ", error);
                setIsLoading(false);
            }
        }
       fetchProfissional();
    }, []);

/*
return(
        <Container>
            {isLoading ? (
                <p>Carregando Informações...</p>
            ) : editMode ? (
                <Form>
                    <Row></Row>
                </Form>
            )
            )}
        </Container>
    )
    */
}