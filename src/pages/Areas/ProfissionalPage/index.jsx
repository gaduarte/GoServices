import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfissionalDashboard from "./ProfissionalPg";

export function ProfissionalDados(){
    const history = useNavigate();
    const[id, setId] = useState(null);

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
                alert("Signed Out");
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
        <ProfissionalDashboard/>
        <button className="logoutPro" ><a href="/profissional/dados">Voltar</a></button>
        </>}
    </div>
    )
}