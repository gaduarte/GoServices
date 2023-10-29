const express = require('express');
const cors = require('cors');
const Goservice = require('./classe');

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

app.get('/cliente/:email', async (req, res) => {
    email = req.params.email;
    mensagem = await gs.retrieveUsuario(email);
  
    if (mensagem == -1) {
      res.status(404).send('Não encontrado');
    }
    res.json(mensagem);
  });
  
app.get('/cliente/1/:id', async(req,res)=>{
    id = req.params.id;
    mensagem = await gs.retrieveUsuarioId(id);

    if(mensagem == -1){res.status(404).send('Não encontrado')}
    res.json(mensagem)
    
})

app.post('/cadastro', async (req, res) => {
    const userType = req.query.type;

    if (userType === "cliente") {
        const user = {
            "email": req.body.email,
            "username": req.body.username,
            "cpf": req.body.cpf,
            "telefone": req.body.telefone,
            "endereco": req.body.endereco,
            "id": req.body.id
        }

        // Registra os dados de cadastro de cliente no console
        console.log('Dados de cadastro de cliente:', user);

        gs.add_usuario(user['email'], user['username'], user['cpf'], user['telefone'], user['endereco'], user['id']);
        res.status(201).send('Cliente Cadstrado.');

        console.log('Cadastro de cliente realizado com sucesso.');
    } else if (userType === "empresa") {
        const userDataEmpresa = {
            "email": req.body.email,
            "username": req.body.username,
            "cnpj": req.body.cnpj,
            "descricao": req.body.descricao,
            "telefone": req.body.telefone,
            "endereco": req.body.endereco,
            "id": req.body.id
        }

        // Registra os dados de cadastro de empresa no console
        console.log('Dados de cadastro de empresa:', userDataEmpresa);

        gs.add_usuario_empresa(userDataEmpresa['email'], userDataEmpresa['username'], ['cnpj'], userDataEmpresa['descricao'], userDataEmpresa['telefone'], userDataEmpresa['enedereco']);
        res.status(201).send('Empresa Cadastrada.');

        console.log('Cadastro de empresa realizado com sucesso.');
    } else if (userType === "profissional") {
        try {
            const userDataProfissional = req.body;

            // Registra os dados de cadastro de profissional no console
            console.log('Dados de cadastro de profissional:', userDataProfissional);

            if (!userDataProfissional || !userDataProfissional.name || !userDataProfissional.specialty) {
                res.status(400).send('Dados de profissional incompletos ou inválidos.');
                return;
            }

            const gs = new Goservice();
            const result = await gs.add_profissional(userDataProfissional.name, userDataProfissional.specialty);

            if (result) {
                res.status(201).send('Profissional Cadastrado.');
            } else {
                res.status(500).send('Erro ao cadastrar o profissional.');
            }
        } catch (error) {
            console.error(error);

            // Registra o erro no console
            console.error('Erro no tratamento de cadastro de profissional:', error);

            res.status(500).send('Erro no servidor.');
        }
    } else {
        res.status(400).send('Tipo de usuário desconhecido.');
    }
});


