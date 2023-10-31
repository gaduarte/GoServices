import React, { useEffect, useState } from "react";
import { Route, Routes, BrowserRouter, NavLink } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import './App.css'
import CadastrarUsuario from "./pages/Cadastro";
import LoginUsuario from "./pages/Cadastro/LoginPage";


function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(()=>{
    const checkFirebase = async () => {
      try{
        //await initializeApp(appF);
        setFirebaseReady(true);
      }catch(error){
        console.error(error);
      }
    };
    checkFirebase();
  },[]);

  if(!firebaseReady){
    return <div>Carregando Firebase....</div>
  }
  return (
    <>
      <div>
        <BrowserRouter>
          <header className="my-header">
            <nav>
              <ul className="my-list">
                <li>
                  <NavLink to="/">Home</NavLink>
                </li>
                <li>
                  <NavLink to="/cadastro">Cadastrar-se</NavLink>
                </li>
                <li>
                  <NavLink to="/login">Login</NavLink>
                </li>
              </ul>
            </nav>
          </header>

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cadastro" element={<CadastrarUsuario />} />
            <Route path="/login" element={<LoginUsuario />}/>

          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
