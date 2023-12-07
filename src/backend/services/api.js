const express = require('express');
const { request: req } = require('express');
const res = require('express/lib/response');
const cors = require('cors');
const Goservice = require('./classe');
const path = require('path');
const {ApolloServer} = require('apollo-server-express');
const {typeDefs, resolvers} = require('./graphql');
const { format, isValid, parse } = require('date-fns');

const app = express();

// Configuração do middleware de CORS
app.use(cors());

// Configuração do middleware de análise de corpo JSON e URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port = process.env.PORT || 3000;
const gs = new Goservice()

const eventosWebhook = [];

app.listen(port, () => {
    console.log(`Rodando na porta: ${port}`);
});

//Webhooks
app.post('/webhook', (req, res) => {
    const eventData = req.body; 
    console.log('Recebido evento do webhook:', eventData);

    eventosWebhook.push(eventData);
    res.status(200).send('Recebido com sucesso');
});

// Rota para acessar dados salvos no webhook.
app.get('/eventos-webhook', async (req,res) => {
    res.json(eventosWebhook);
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

// Função assíncrona para iniciar um servidor GraphQL usando Apollo Server
async function startApolloServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
}

startApolloServer();

//Rota para recuperar informções do serviço por ID.
app.get('/servico/1/:id', async(req, res)=>{
    const id = req.params.id;
    const mensagem = await gs.retrieveServicoId(id);

    if(mensagem == -1){res.status(400).send("Não encontrado")}
    res.json(mensagem);
})

// Rota para recuperar informações do cliente por email
app.get('/cliente/:email', async (req, res) => {
    const email = req.params.email;
    try{
        const mensagem = await gs.retrieveUsuario(email);
  
        if (mensagem == -1) {
            res.status(404).send('Não encontrado');
        }
        res.json(mensagem);
    }catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send('Erro interno ao processar a requisição');
    }
    
  });

// Rota para recuperar informações do cliente por ID
app.get('/cliente/1/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const mensagem = await gs.retrieveUsuarioId(id);
        if (mensagem == -1) {
            res.status(404).send('Não encontrado');
        }
        res.json(mensagem);
    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send('Erro interno ao processar a requisição');
    }
});

// Rota para atualizar informações do cliente por ID
app.put('/cliente/:id', async(req,res)=>{
    const id = req.params.id;
    try {
        const mensagem = await gs.atualizarUsuarioCliente(id, req.body);
        if (mensagem === -1) {
            res.status(404).send('Não encontrado');
        } else {
            res.json(mensagem);
        }
    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send('Erro interno ao processar a requisição');
    }
})

// Rota para cadastrar um novo cliente
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

    const webhookURL = 'http://localhost:3000/webhook';
    const webhookData = {
        eventType: 'NovoClienteCadastrado',
        cliente: {
            tipo: 'Cliente',
            data: user
        }
    };

    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData),
        });
    
        if (!response.ok) {
            throw new Error('Erro na solicitação do webhook');
        }
    
        console.log('Dados enviados para o webhook com sucesso.');
    } catch (error) {
        console.error('Erro ao enviar dados para o webhook:', error);
    }

    console.log('Cadastro de cliente realizado com sucesso.');
});

// Rota para excluir conta do cliente por ID
app.delete('/cliente/remove/1/:id', async(req,res)=>{
    const id = req.params.id;
    try{
        await gs.excluirConta(id);
        res.status(200).send('Conta excluída com sucesso!');
    } catch (error) {
        console.error("Erro ao excluir conta", error);
        res.status(500).send('Erro ao excluir conta');
    }
    
});

// Rota para adicionar um novo Cartão.
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

        const webhookURL = 'http://localhost:3000/webhook';
        const webhookData = {
            eventType: 'NovoCartaoCadastrado',
            cliente: {
                tipo: 'Cartao',
                data: cartaoData
            }
        };
    
        try {
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData),
            });
        
            if (!response.ok) {
                throw new Error('Erro na solicitação do webhook');
            }
        
            console.log('Dados enviados para o webhook com sucesso.');
        } catch (error) {
            console.error('Erro ao enviar dados para o webhook:', error);
        }

        console.log('Simulação: Cadastro de cartão realizado com sucesso.');
        res.status(200).json({ message: 'Cartão cadastrado com sucesso!' });
    }catch (error) {
        console.error("Erro ao cadastrar serviço", error);
        res.status(500).json({ error: 'Erro interno ao cadastrar serviço' });
      }
});

//Rota para recuperar informações do cartao por ID.
app.get('/cliente/:clienteId/cartao/:cartaoId', async (req, res) => {
    const clienteId = req.params.clienteId;
    const cartaoId = req.params.cartaoId;

    try {
        const cartaoData = await gs.retrieveCartao(clienteId, cartaoId);

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

// Rota para excluir cartão por ID.
app.delete('/cartao/remove/1/:cartaoId', async (req, res) => {
    const cartaoId = req.params.cartaoId;

    try {
        await gs.excluirCartao(cartaoId);
        res.status(200).json('Cartão excluído com Sucesso!');
    } catch (error) {
        console.error("Erro ao excluir cartão:", error);
        res.status(500).json('Erro ao excluir cartão.');
    }
});


// Rota para recuperar informações da empresa por email
app.get('/empresa/:email', async (req, res) => {
    const email = req.params.email;
    try{
        const mensagem = await gs.retrieveUsuarioEmpresa(email);
  
        if (mensagem == -1) {
        res.status(404).send('Não encontrado');
        }
        res.json(mensagem);
    }catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send('Erro interno ao processar a requisição');
    }
    
  });

// Rota para recuperar informações da empresa por ID.
app.get('/empresa/1/:id', async(req,res)=>{
    const id = req.params.id;
    try{
        const mensagem = await gs.retrieveUsuarioEmpresaId(id);

        if(mensagem == -1){res.status(404).send('Não encontrado')}
        res.json(mensagem)
    }catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send('Erro interno ao processar a requisição');
    }
});

// Rota para atualizar informações da empresa por ID.
app.put('/empresa/:id', async (req, res) => {
    const id = req.params.id;
    try{
        const mensagem = await gs.atualizarUsuarioEmpresa(id, req.body);

        if (mensagem === -1) {
            res.status(404).send('Não encontrado');
        } 
            res.json(mensagem);
    }catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send('Erro interno ao processar a requisição');
    }
});

// Rota para atualizar serviço por ID.
app.put('/empresa/servico/:id', async(req,res)=>{
    const id = req.params.id;
    try{
        const mensagem = await gs.atualizarServico(id, req.body);
        console.log("ID do Serviço a ser atualizado:", id);
        console.log("Dados Recebidos pela API:", req.body);
    
        if (mensagem === -1) {
            res.status(404).send('Não encontrado');
        } 
            res.json(mensagem);
    }catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send('Erro interno ao processar a requisição');
    }
});

// Rota para cadastro de nova empresa.
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

    const webhookURL = 'http://localhost:3000/webhook';
    const webhookData = {
        eventType: 'NovaEmpresaCadastrado',
        cliente: {
            tipo: 'Empresa',
            data: userDataEmpresa
        }
    };

    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData),
        });
    
        if (!response.ok) {
            throw new Error('Erro na solicitação do webhook');
        }
    
        console.log('Dados enviados para o webhook com sucesso.');
    } catch (error) {
        console.error('Erro ao enviar dados para o webhook:', error);
    }

    console.log('Cadastro de empresa realizado com sucesso.');
});

// Rota para empresa cadastrar novo serviço
app.post('/addServico', async (req, res) => {
    try {
      const generatedId = generateUniqueId();
  
      const servicoData = {
        descricao: req.body.descricao,
        nome: req.body.nome,
        valor: req.body.valor,
        empresa: req.body.empresa,
        categoria: req.body.categoria,
        empresaId: req.body.empresaId,
        profissional: req.body.profissional,
        id: generatedId,
      };
  
      console.log('Dados de serviço de empresa:', servicoData);
  
      const webhookURL = 'http://localhost:3000/webhook';
      const webhookData = {
          eventType: 'NovoServicoCadastrado',
          cliente: {
              tipo: 'Servico',
              data: servicoData
          }
      };
  
      try {
          const response = await fetch(webhookURL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(webhookData),
          });
      
          if (!response.ok) {
              throw new Error('Erro na solicitação do webhook');
          }
      
          console.log('Dados enviados para o webhook com sucesso.');
      } catch (error) {
          console.error('Erro ao enviar dados para o webhook:', error);
      }

      console.log('Simulação: Cadastro de serviço realizado com sucesso.');
  
      res.status(200).json({ message: 'Serviço cadastrado com sucesso!' });
    } catch (error) {
      console.error("Erro ao cadastrar serviço", error);
      res.status(500).json({ error: 'Erro interno ao cadastrar serviço' });
    }
  });

// Rota para empresa adicionar horário.
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
        const formattedDate = horarioData.diasSelecionados.toLocaleString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZone: 'America/Sao_Paulo',
          });
          console.log('Data formatada:', formattedDate);              
        console.log('Dados de horário de empresa:', horarioData);
        const webhookURL = 'http://localhost:3000/webhook';
        const webhookData = {
            eventType: 'NovoHorarioCadastrado',
            cliente: {
                tipo: 'Horario',
                data: { ...horarioData, diasSelecionados: formattedDate }
            }
        };
        try {
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData),
            });
            if (!response.ok) {
                throw new Error('Erro na solicitação do webhook');
            }
            console.log('Dados enviados para o webhook com sucesso.');
        } catch (error) {
            console.error('Erro ao enviar dados para o webhook:', error);
        }
      console.log('Simulação: Cadastro de serviço realizado com sucesso.');
  
      res.status(200).json({ message: 'Serviço cadastrado com sucesso!' });
    } catch (error) {
      console.error("Erro ao cadastrar serviço", error);
      res.status(500).json({ error: 'Erro interno ao cadastrar serviço' });
    }
});

// Rota para excluir empresa por ID.
app.delete('/empresa/remove/1/:id', async(req, res)=>{
    const id = req.params.id;
    try{
        await gs.excluirEmpresa(id);
        res.status(200).send("Conta excluída com sucesso!");
    }catch(error){
        console.error("Erro ao excluir conta", error);
        res.status(500).send("Erro ao excluir conta");
    }
});

// Rota para recuperar informações do profissional por email.
app.get('/profissional/:email', async (req, res)=>{
    const email = req.params.email;
    try{
        const mensagem = await gs.retrieveProfissional(email);

        if(mensagem == -1){
            res.status(404).send('Não encontrado');
        }
        res.json(mensagem);
    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send('Erro interno ao processar a requisição');
    }

})

// Rota para recuperar informações do profissional por ID.
app.get('/profissional/1/:id', async(req,res)=>{
    const id = req.params.id;
    try{
        const mensagem = await gs.retrieveProfissionalId(id);

        if(mensagem == -1){res.status(404).send('Não encontrado')}
        res.json(mensagem);
    }catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send('Erro interno ao processar a requisição');
    }

});

// Rota para o Cadastro de nova Pessoa Prestadora de Serviço
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

    const webhookURL = 'http://localhost:3000/webhook';
    const webhookData = {
        eventType: 'NovoProfissionalCadastrado',
        cliente: {
            tipo: 'Profissional',
            data: userDataProfissional
        }
    };

    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData),
        });
    
        if (!response.ok) {
            throw new Error('Erro na solicitação do webhook');
        }
    
        console.log('Dados enviados para o webhook com sucesso.');
    } catch (error) {
        console.error('Erro ao enviar dados para o webhook:', error);
    }

    console.log('Cadastro de profissional realizado com sucesso.');
});

// Rota para atualizar informações da pessoa prestadora de serviço por ID.
app.put('/profissional/:id', async(req,res)=>{
    const id = req.params.id;
    try{
        const mensagem = await gs.atualizarUsuarioProfissional(id, req.body);

        if (mensagem === -1) {
            res.status(404).send('Não encontrado');
        } 
        res.json(mensagem);
    }catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send('Erro interno ao processar a requisição');
    }
});

// Rota para excluir conta da pessoa prestadora de serviço por ID.
app.delete('/profissional/remove/1/:id', async(req,res)=>{
    const id = req.params.id;
    try{
        await gs.excluirProfissional(id);
        res.status(200).send("Conta excluída com sucesso!");
    }catch(error){
        console.error("Erro ao excluir conta", error);
        res.status(500).send("Erro ao excluir conta.");
    }
});

//Rota para recuperar informações do agendamento por ID.
app.get('/agendamento/:id', async(req, res)=>{
    const id = req.params.id;
    const mensagem = await gs.retrieveAgendamento(id)
    
    if(mensagem == -1){res.status(404).send('Não encontrado')}
    res.json(mensagem);
});

//Rota para retornar todos os  agendamentos
app.get('/agendamentos', async (req, res) => {
    const agendamentos = await gs.retrieveAllAgendamentos();
    res.json(agendamentos);
});

// Rota para cadastrar um novo agendamento.
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
            status: req.body.status,
            id: generatedId,
        };

        console.log("Dados de agendamento do cliente", agendamentoData);

        agendamentoData.clienteId,
        agendamentoData.empresaId,
        agendamentoData.profissionalId,
        agendamentoData.servicoId,
        agendamentoData.cartao,
        agendamentoData.dataAgendamento,
        agendamentoData.status,
        agendamentoData.id

        console.log("Cadastro de agendamento realizado com sucesso! ");

        res.status(200).json({message: "Agendamento cadastrado com sucesso!"});
    }catch(error){
        console.error("Erro ao cadastrar agendamento", error );
        res.status(500).json({error: "Erro interno ao cadastrar agendamento"});
    }
});

// Rota para adicionar um novo Favorito.
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

        const webhookURL = 'http://localhost:3000/webhook';
        const webhookData = {
            eventType: 'NovoFavoritoCadastrado',
            cliente: {
                tipo: 'Favorito',
                data: favoritosData
            }
        };

        try {
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData),
            });
        
            if (!response.ok) {
                throw new Error('Erro na solicitação do webhook');
            }
        
            console.log('Dados enviados para o webhook com sucesso.');
        } catch (error) {
            console.error('Erro ao enviar dados para o webhook:', error);
        }


        console.log("Cadastro de favoritos realizado com sucesso!");
        res.status(200).json({message: "Favoritos cadastrado com sucesso!"});
    }catch(error){
        console.error("Erro ao cadastrar favoritos", error );
        res.status(500).json({error: "Erro interno ao cadastrar favoritos"});
    }
});

// Rota para cancelar um agendamento por ID.
app.delete('/agendamento/remove/:id', async(req, res) => {
    const id = req.params.id;
    try{
        await gs.excluirAgendamento(id);
        res.status(200).send("Agendamento cancelado com sucesso!");
    }catch (error) {
        console.error("Erro ao cancelar agendamento", error);
        res.status(500).send('Erro ao cancelar agendamento');
    }
});

// Rota para excluir um favorito por ID.
app.delete('/favorito/remove/:id', async(req, res) => {
    const id = req.params.id;
    try{
        await gs.excluirFavorito(id);
        res.status(200).send("Favorito removido com sucesso!");
    }catch (error) {
        console.error("Erro ao excluir conta", error);
        res.status(500).send('Erro ao excluir favorito');
    }
});

// Rota para excluir um serviço por ID.
app.delete('/servico/remove/:id', async(req, res) => {
    const id = req.params.id;
    try{
        await gs.excluirServico(id);
        res.status(200).send("Serviço removido com sucesso!");
    }catch (error) {
        console.error("Erro ao excluir serviço", error);
        res.status(500).send('Erro ao excluir serviço');
    }
});


