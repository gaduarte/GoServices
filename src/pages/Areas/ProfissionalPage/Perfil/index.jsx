import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import ProfissionalPerfil from "./PerfilProfissional";

export function ProfissionalDadosPerfil() {
  const history = useNavigate();
  const [id, setId] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const auth = getAuth();

    auth.onAuthStateChanged(async function (user) {
      if (user) {
        const id = user.uid;
        setId(id); 
      } else {
        history("/login");
      }
    });
  }, [history]);

  return (
    <div>
      {id && 
        <>
          <ProfissionalPerfil /> 
          {alertMessage && <div style={{color: "green"}}>{alertMessage}</div>}
        </>
    }
    </div>
  );
}