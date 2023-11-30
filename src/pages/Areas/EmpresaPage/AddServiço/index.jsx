import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmpresaAddServico from "./EmpresaAddServiço";
import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";


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
            <button className="buttonpadEmp">
                <NavLink to="/atualizaServico" style={{color: "white"}}> <i className="fas fa-sync-alt"></i> Atualizar Serviço</NavLink>
            </button>
            {alertMessage && <div style={{color: "green"}}>{alertMessage}</div>}
            <button className="logoutEmp"><a href="/empresa/dados">Voltar</a></button>
            </>}
        </div>
    )
}