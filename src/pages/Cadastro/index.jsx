import React, { useState } from "react";
import CadastroCliente from "./Cadastro_Cliente";
import CadastroEmpresa from "./Cadastro_Empresa";
import CadastroProfissional from "./Cadastro_Profissional";
import styles from './Cadastro_Empresa/Empresa.module.css';

const CadastrarUsuario = () => {
  const [opcao, setOpcao] = useState("cliente");

  const handleChangeOpcao = (event) => {
    setOpcao(event.target.value);
  };

  return (
    <div className={styles.select}>
      <select value={opcao} onChange={handleChangeOpcao}>
        <option value="cliente">Cliente</option>
        <option value="empresa">Empresa</option>
        <option value="profissional">Profissional</option>
      </select>

      {opcao === "cliente" && <CadastroCliente />}
      {opcao === "empresa" && <CadastroEmpresa />}
      {opcao === "profissional" && <CadastroProfissional />}
    </div>
  );
};

export default CadastrarUsuario;



