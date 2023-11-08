import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClienteDashboard from "./ClienteDashboard";

export function ClienteDados() {
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

  const logOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setAlertMessage("Signed Out");
        history("/login");
      })
      .catch((error) => {
        console.error("Sign out Error", error);
      });
  };

  return (
    <div>
      {id && 
        <>
          <ClienteDashboard /> 
          {alertMessage && <div style={{color: "green"}}>{alertMessage}</div>}
          <button onClick={logOut}>Sign Out</button>
        </>
    }
    </div>
  );
}
