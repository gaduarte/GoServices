import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmpresaAddServico from "./EmpresaAddServiço";
import { NavLink } from "react-router-dom";


export function EmpresaAdicionaServ() {
    const history = useNavigate();
    const[id, setId] = useState(null);

    const [alertMessage, setAlertMessage] = useState("");

    useEffect(()=>{
        const auth = getAuth();

        auth.onAuthStateChanged(async function (user){
            if(user){
                const id = user.uid;
                setId(id);
            }else {
                history("/login");
            }
        });
    }, [history]);

    const logOut = () => {
        const auth = getAuth();
        signOut(auth)
            .then(()=>{
                setAlertMessage("Signed Out");
                history("/login");
            })
            .catch((error)=>{
                console.error("Sign out Error", error);
            }); 
    };

    return(
        <div>
            {id && 
            <>
            <EmpresaAddServico />
            <button style={{margin: "10px", fontSize: "15px"}}>
                <NavLink to="/atualizaServico" style={{color: "white"}}>Atualizar Serviço</NavLink>
            </button>
            <button style={{margin: "10px", fontSize: "15px"}}>
                <NavLink to="/horarios" style={{color: "white"}}>Adicionar Horário</NavLink>
            </button>
            {alertMessage && <div style={{color: "green"}}>{alertMessage}</div>}
            <button onClick={logOut} style={{margin: "10px", fontSize: "15px"}}>Sign Out</button>
            </>}
        </div>
    )
}