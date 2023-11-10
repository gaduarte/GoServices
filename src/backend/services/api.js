const express = require('express');
const { request: req } = require('express');
const res = require('express/lib/response');
const cors = require('cors');
const Goservice = require('./classe');
const path = require('path');

const app = express();

// Configuração do middleware de CORS
app.use(cors());

// Configuração do middleware de análise de corpo JSON e URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port = 3000;
const gs = new Goservice()


app.listen(port, () => {
    console.log(`Rodando na porta: ${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../', 'pages', 'HomePage', 'index.jsx'));
});

// Função para gerar IDs únicos
function generateUniqueId() {
    const timestamp = new Date().getTime(); 
    const randomPart = Math.floor(Math.random() * 10000); 
    return `${timestamp}-${randomPart}`;
}


// Cliente
app.get('/cliente/:email', async (req, res) => {
    const email = req.params.email;
    const mensagem = await gs.retrieveUsuario(email);
  
    if (mensagem == -1) {
      res.status(404).send('Não encontrado');
    }
    res.json(mensagem);
  });
  
app.get('/cliente/1/:id', async(req,res)=>{
    const id = req.params.id;
    const mensagem = await gs.retrieveUsuarioId(id);

    if(mensagem == -1){res.status(404).send('Não encontrado')}
    res.json(mensagem)
    
})

// Cadastro Cliente
app.post('/cadastro/cliente', async (req, res) => {
    const generatedId = generateUniqueId();

    const user = {
        username: req.body.username,
        email: req.body.email,
        endereco: req.body.endereco,
        cpf: req.body.cpf,
        telefone: req.body.telefone,
        id: generatedId,
    }

    console.log('Dados de cadastro de cliente:', user);

    user.email,
    user.username,
    user.cpf,
    user.telefone,
    user.endereco,
    user.id

    console.log('Cadastro de cliente realizado com sucesso.');
});

app.post('/addCartao', async(req,res)=>{
    try{
        const generatedId = generateUniqueId();

        const cartaoData = {
            numero: req.body.numero,
            codigo: req.body.codigo,
            nome: req.body.nome,
            endereco: req.body.endereco,
            dataValidade: req.body.dataValidade,
            id: generatedId
        };
        console.log("Cartão adicionando", cartaoData);

        cartaoData.numero,
        cartaoData.nome,
        cartaoData.endereco,
        cartaoData.dataValidade,
        cartaoData.id

        console.log('Simulação: Cadastro de cartão realizado com sucesso.');
        res.status(200).json({ message: 'Cartão cadastrado com sucesso!' });
    }catch (error) {
        console.error("Erro ao cadastrar serviço", error);
        res.status(500).json({ error: 'Erro interno ao cadastrar serviço' });
      }
})

// Empresa 
app.get('/empresa/:email', async (req, res) => {
    const email = req.params.email;
    const mensagem = await gs.retrieveUsuarioEmpresa(email);
  
    if (mensagem == -1) {
      res.status(404).send('Não encontrado');
    }
    res.json(mensagem);
  });
  
app.get('/empresa/1/:id', async(req,res)=>{
    const id = req.params.id;
    const mensagem = await gs.retrieveUsuarioEmpresaId(id);

    if(mensagem == -1){res.status(404).send('Não encontrado')}
    res.json(mensagem)
    
})

// Cadastro Empresa
app.post('/cadastro/empresa', async (req, res) => {
    const generatedId = generateUniqueId();
    
    const userDataEmpresa = {
        email: req.body.email,
        username: req.body.username,
        cnpj: req.body.cnpj,
        descricao: req.body.descricao,
        telefone: req.body.telefone,
        endereco: req.body.endereco,
        id: generatedId,
    }

    console.log('Dados de cadastro de empresa:', userDataEmpresa);

    userDataEmpresa.email,
    userDataEmpresa.username,
    userDataEmpresa.cnpj,
    userDataEmpresa.descricao,
    userDataEmpresa.endereco,
    userDataEmpresa.telefone,
    userDataEmpresa.id

    console.log('Cadastro de empresa realizado com sucesso.');
});


app.post('/addServico', async (req, res) => {
    try {
      const generatedId = generateUniqueId();
  
      const servicoData = {
        descricao: req.body.descricao,
        nome: req.body.nome,
        valor: req.body.valor,
        empresa: req.body.empresa,
        empresaId: req.body.empresaId,
        id: generatedId,
      };
  
      console.log('Dados de serviço de empresa:', servicoData);
  
      servicoData.descricao,
      servicoData.nome,
      servicoData.valor,
      servicoData.empresa,
      servicoData.empresaId,
      servicoData.id

      console.log('Simulação: Cadastro de serviço realizado com sucesso.');
  
      res.status(200).json({ message: 'Serviço cadastrado com sucesso!' });
    } catch (error) {
      console.error("Erro ao cadastrar serviço", error);
      res.status(500).json({ error: 'Erro interno ao cadastrar serviço' });
    }
  });
  

// Pessoa Portadora de Serviço
app.get('/profissional/:email', async (req, res)=>{
    const email = req.params.email;
    const mensagem = await gs.retrieveProfissional(email);

    if(mensagem == -1){
        res.status(404).send('Não encontrado');
    }
    res.json(mensagem);
})

app.get('/profissional/1/:id', async(req,res)=>{
    const id = req.params.id;
    const mensagem = await gs.retrieveProfissionalId(id);

    if(mensagem == -1){res.status(404).send('Não encontrado')}
    res.json(mensagem);
})

// Cadastro Pessoa Prestadora de Serviço
app.post('/cadastro/profissional', async (req, res) => {
    const generatedId = generateUniqueId();

    const userDataProfissional = {
        email: req.body.email,
        username: req.body.username,
        cpf: req.body.cpf,
        empresa: req.body.empresa,
        tipoServico: req.body.tipoServico,
        telefone: req.body.telefone,
        endereco: req.body.endereco,
        id: generatedId
    }

    console.log('Dados de cadastro de profissional:', userDataProfissional);

    userDataProfissional.email,
    userDataProfissional.username,
    userDataProfissional.cpf,
    userDataProfissional.empresa,
    userDataProfissional.tipoServico,
    userDataProfissional.endereco,
    userDataProfissional.id

    console.log('Cadastro de profissional realizado com sucesso.');
});

//Agendamento




