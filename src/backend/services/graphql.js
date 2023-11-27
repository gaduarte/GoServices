const { gql } = require('apollo-server');
const Goservice = require('./classe');

const gs = new Goservice();

// Consultas com Graphql

const typeDefs = gql`
    type Query {
        servico(id: ID!): Servico
        cliente(id: ID!): Cliente
        empresa(id: ID!): Empresa
        profissional(id: ID!): Profissional
        agendamento(id: ID!): Agendamento
        favorito(id: ID!): Favorito
        horario(id: ID!): Horario
        cartao(id: ID!): Cartao
        agendamentos: [Agendamentos]!
        servicos: [Servicos]!
    }      

    type Servico {
        id: ID!
        nome: String!
        descricao: String!
        empresa: String!
        valor: String!
    }

    type Cliente {
        id: ID!
        username: String!
        email: String!
        cpf: String!
        endereco: String!
        telefone: String!
    }

    type Empresa {
        id: ID!
        username: String!
        email: String!
        cnpj: String!
        descricao: String!
        endereco: String!
        telefone: String!
    }

    type Profissional {
        id: ID!
        username: String!
        email: String!
        empresa: String!
        cpf: String!
        endereco: String!
        tipoServico: String!
        telefone: String!
    }

    type Agendamento {
        id: ID!
        clienteId: String!
        empresaId: String!
        profissionalId: String!
        servicoId: String!
        dataAgendamento: String!
    }

    type Favorito {
        id: ID!
        clienteId: String!
        empresaId: String!
        servicoId: String!
    }

    type Horario {
        id: ID!
        diasSelecionados: String!
        empresaId: String!
        servico: String!
        status: Boolean!
    }

    type Cartao {
        id: ID!
        numero: Int!
        codigo: Int!
        nome: String!
        endereco: String!
        dataValidade: String!
    }

    type Agendamentos {
        id: ID!
        clienteId: String!
        empresaId: String!
        profissionalId: String!
        servicoId: String!
        dataAgendamento: String!
    }

   type Servicos {
        id: ID!
        nome: String!
        descricao: String!
        empresa: String!
        valor: String!
   }
`;

const resolvers = {
    Query: {
        servico: async (parent, { id }) => {
            console.log("Consultando serviço com ID:", id);
            const result = await gs.retrieveServicoId(id);
            console.log("Resultado da consulta:", result);
            return result;
        },
        cliente: async (parent, { id }) => {
            console.log("Consultando cliente com ID:", id);
            const result = await gs.retrieveUsuarioId(id);
            console.log("Resultado da consulta:", result);
            return result;
        },
        empresa: async (parent, { id }) => {
            console.log("Consultando serviço com ID: ", id);
            const result = await gs.retrieveUsuarioEmpresaId(id);
            console.log("Resultado da consulta: ", result);
            return result;
        },
        profissional: async (parent, { id }) => {
            console.log("Consultando Profissional com id: ", id);
            const result = await gs.retrieveProfissionalId(id);
            console.log("Resultado da consulta: ", result);
            return result;
        },
        agendamento: async (parent, { id }) => {
            console.log("Consultando Agendamento de id: ", id);
            const result = await gs.retrieveAgendamento(id);
            console.log("Resultados da consulta: ", result);
            return result;
        },
        favorito: async (parent, { id }) => {
            console.log("Consultando Favorito de id: ", id);
            const resutl = await gs.retrieveFavorito(id);
            console.log("Resultado da consulta: ", resutl);
            return resutl;
        },
        horario: async (parent, { id }) => {
            console.log("Consultando Horario de id: ", id);
            const result = await gs.retrieveHorario(id);
            console.log("Resultado da consulta: "), result;
            return result;
        },
        cartao: async (parent, { id }) => {
            console.log("Consultando Cartão de id: ", id);
            const result = await gs.retrieveCartao(id);
            console.log("Resultado da Consulta: ", result);
            return result;
        },
        agendamentos: async (parent) => {
            const result = await gs.retrieveAllAgendamentos();
            return result; 
        },
        servicos: async (parent) => {
            const result = await gs.retrieveAllServicos();
            return result;
        }
    },
};

module.exports = {
    typeDefs,
    resolvers,
};


