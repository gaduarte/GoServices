import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ClienteAddCartao from "./AddCartao";

export function ClienteAdicionaCartao() {
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
            <ClienteAddCartao />
            <button>
                <NavLink to="/cartoes" state={{color: "white"}}>Meus Cartões</NavLink>
            </button>
            {alertMessage && <div style={{color: "green"}}>{alertMessage}</div>}
            <button className="logoutCli"><a href="/cliente/dados">Voltar</a></button>
            </>}
        </div>
    )

}