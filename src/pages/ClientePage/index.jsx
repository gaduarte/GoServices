import { getAuth, signOut } from "firebase/auth";
import { getDatabase, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function ClienteDados() {
  const history = useNavigate();
  const [id, setId] = useState(null); 

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
        alert("Signed Out");
        history("/login");
      })
      .catch((error) => {
        console.error("Sign out Error", error);
      });
  };

  return (
    <div>
      {id && (
        <>
          <p>Hello, user with ID: {id}</p>
          <button onClick={logOut}>Sign Out</button>
        </>
      )}
    </div>
  );
}