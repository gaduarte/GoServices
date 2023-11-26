const express = require('express');
const { request: req } = require('express');
const res = require('express/lib/response');
const cors = require('cors');
const Goservice = require('./classe');
const path = require('path');
const {ApolloServer} = require('apollo-server-express');
const {typeDefs, resolvers} = require('./graphql');
const { buildSchema } = require('graphql');


const app = express();

// Configuração do middleware de CORS
app.use(cors());

// Configuração do middleware de análise de corpo JSON e URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port = process.env.PORT || 3000;
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

async function startApolloServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
}

startApolloServer();

//Serviço
app.get('/servico/1/:id', async(req, res)=>{
    const id = req.params.id;
    const mensagem = await gs.retrieveServicoId(id);

    if(mensagem == -1){res.status(400).send("Não encontrado")}
    res.json(mensagem);
})

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

app.put('/cliente/:id', async(req,res)=>{
    const id = req.params.id;
    const mensagem = await gs.atualizarUsuarioCliente(id, req.body);

    if (mensagem === -1) {
        res.status(404).send('Não encontrado');
    } 
        res.json(mensagem);
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

app.delete('/cliente/remove/1/:id', async(req,res)=>{
    const id = req.params.id;
    try{
        await gs.excluirConta(id);
        res.status(200).send('Conta excluída com sucesso!');
    } catch (error) {
        console.error("Erro ao excluir conta", error);
        res.status(500).send('Erro ao excluir conta');
    }
    
})

// Cartão
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

app.get('/cartao/1/:id', async (req, res) => {
    const clienteId = req.params.id;

    try {
        const cartaoData = await gs.retrieveCartao(clienteId);

        if (!cartaoData) {
            res.status(404).send('Cartao not found.');
        } else {
            res.json(cartaoData);
        }
    } catch (error) {
        console.error("Error retrieving cartao:", error);
        res.status(500).send('Error retrieving cartao.');
    }
});


app.delete('/cartao/remove/1/:id/', async (req, res) => {
    const id = req.params.id;

    try {
        await gs.excluirCartao(id);
        res.status(200).json('Cartão excluído com Sucesso!');
    } catch (error) {
        console.error("Erro ao excluir cartão:", error);
        res.status(500).json('Erro ao excluir cartão.');
    }
});


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

app.put('/empresa/:id', async (req, res) => {
    const id = req.params.id;
    const mensagem = await gs.atualizarUsuarioEmpresa(id, req.body);

    if (mensagem === -1) {
        res.status(404).send('Não encontrado');
    } 
        res.json(mensagem);

});

app.put('/empresa/servico/:id', async(req,res)=>{
    const id = req.params.id;
    const mensagem = await gs.atualizarServico(id, req.body);
    console.log("ID do Serviço a ser atualizado:", id);
    console.log("Dados Recebidos pela API:", req.body);

    if (mensagem === -1) {
        res.status(404).send('Não encontrado');
    } 
        res.json(mensagem);
});

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

// Empresa Cadastra Serviço
app.post('/addServico', async (req, res) => {
    try {
      const generatedId = generateUniqueId();
  
      const servicoData = {
        descricao: req.body.descricao,
        nome: req.body.nome,
        valor: req.body.valor,
        empresa: req.body.empresa,
        empresaId: req.body.empresaId,
        profissional: req.body.profissional,
        id: generatedId,
      };
  
      console.log('Dados de serviço de empresa:', servicoData);
  
      servicoData.descricao,
      servicoData.nome,
      servicoData.valor,
      servicoData.empresa,
      servicoData.empresaId,
      servicoData.profissional,
      servicoData.id

      console.log('Simulação: Cadastro de serviço realizado com sucesso.');
  
      res.status(200).json({ message: 'Serviço cadastrado com sucesso!' });
    } catch (error) {
      console.error("Erro ao cadastrar serviço", error);
      res.status(500).json({ error: 'Erro interno ao cadastrar serviço' });
    }
  });

//Adicionar Horário
app.post('/addHorario', async(req,res)=>{
    try{
        const generatedId = generateUniqueId();

        const horarioData = {
            diasSelecionados: req.body.horario,
            empresaID: req.body.empresaId,
            servico: req.body.servico,
            status: req.body.status,
            id: generatedId
        };

        console.log('Dados de serviço de empresa:', horarioData);

        horarioData.diasSelecionados,
        horarioData.empresaID,
        horarioData.servico,
        horarioData.status,
        horarioData.id

      console.log('Simulação: Cadastro de serviço realizado com sucesso.');
  
      res.status(200).json({ message: 'Serviço cadastrado com sucesso!' });
    } catch (error) {
      console.error("Erro ao cadastrar serviço", error);
      res.status(500).json({ error: 'Erro interno ao cadastrar serviço' });
    }
});


app.delete('/empresa/remove/1/:id', async(req, res)=>{
    const id = req.params.id;

    try{
        await gs.excluirEmpresa(id);
        res.status(200).send("Conta excluída com sucesso!");
    }catch(error){
        console.error("Erro ao excluir conta", error);
        res.status(500).send("Erro ao excluir conta");
    }
})

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

app.put('/profissional/:id', async(req,res)=>{
    const id = req.params.id;
    const mensagem = await gs.atualizarUsuarioProfissional(id, req.body);

    if (mensagem === -1) {
        res.status(404).send('Não encontrado');
    } 
        res.json(mensagem);
})

app.delete('/profissional/remove/1/:id', async(req,res)=>{
    const id = req.params.id;
    try{
        await gs.excluirProfissional(id);
        res.status(200).send("Conta excluída com sucesso!");
    }catch(error){
        console.error("Erro ao excluir conta", error);
        res.status(500).send("Erro ao excluir conta.");
    }
})


//Agendamento
app.get('/agendamento/:id', async(req, res)=>{
    const id = req.params.id;
    const mensagem = await gs.retrieveAgendamento(id)
    
    if(mensagem == -1){res.status(404).send('Não encontrado')}
    res.json(mensagem);
})

//Retorna todos os agendamentos
app.get('/agendamentos', async (req,res)=>{
    const mensagem = await gs.retrieveAllAgendamentos()
    res.json(mensagem);
})

// Adiciona um agendamento.
app.post('/addAgendamento', async (req, res)=>{
    try{
        const generatedId = generateUniqueId();

        const agendamentoData = {
            clienteId: req.body.clienteId,
            empresaId: req.body.empresaId,
            profissionalId: req.body.profissionalId,
            servicoId: req.body.servicoId,
            cartao: req.body.cartao,
            dataAgendamento: req.body.dataAgendamento,
            id: generatedId,
        };

        console.log("Dados de agendamento do cliente", agendamentoData);

        agendamentoData.clienteId,
        agendamentoData.empresaId,
        agendamentoData.profissionalId,
        agendamentoData.servicoId,
        agendamentoData.cartao,
        agendamentoData.dataAgendamento,
        agendamentoData.id

        console.log("Cadastro de agendamento realizado com sucesso! ");

        res.status(200).json({message: "Agendamento cadastrado com sucesso!"});
    }catch(error){
        console.error("Erro ao cadastrar agendamento", error );
        res.status(500).json({error: "Erro interno ao cadastrar agendamento"});
    }
})


// Favoritos
app.post('/addFavoritos', async(req,res)=>{
    try{
        const generatedId = generateUniqueId();

        const favoritosData = {
            clienteId: req.body.clienteId,
            empresaId: req.body.empresaId,
            servicoId: req.body.servicoId,
            id: generatedId,
        };

        console.log("Dados dos favoritos do cliente", favoritosData);

        favoritosData.clienteId,
        favoritosData.empresaId,
        favoritosData.servicoId,
        favoritosData.id

        console.log("Cadastro de favoritos realizado com sucesso!");
        res.status(200).json({message: "Favoritos cadastrado com sucesso!"});
    }catch(error){
        console.error("Erro ao cadastrar favoritos", error );
        res.status(500).json({error: "Erro interno ao cadastrar favoritos"});
    }
});

app.delete('/favorito/remove/:id', async(req, res) => {
    const id = req.params.id;
    try{
        await gs.excluirFavorito(id);
        res.status(200).send("Favorito removido com sucesso!");
    }catch (error) {
        console.error("Erro ao excluir conta", error);
        res.status(500).send('Erro ao excluir favorito');
    }
})



