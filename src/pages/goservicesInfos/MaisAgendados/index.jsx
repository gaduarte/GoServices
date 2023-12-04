import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MaisAgendados from "./MaisAgendados";

export function MaisAgendamentoDados() {
    const history = useNavigate();
    const[id, setId] = useState(null);

    const [alertMessage, setAlertMessage] = useState("");



    return(
        <div>
            <>
            < MaisAgendados />
            {alertMessage && <div style={{color: "green"}}>{alertMessage}</div>}
            </>
        </div>
    )
}