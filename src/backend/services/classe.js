const admin = require('firebase-admin');
const serviceAccount = require('../Firebase/key.json');
const { doc, deleteDoc, collection, getDocs } = require('firebase/firestore');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

let Goservice = class {
    constructor(){
        this.servicos = []
    }

    // Cliente
    async add_usuario(email, username, cpf, telefone, endereco, uid) {
        const userRef = db.collection("cliente").doc(uid);

        const userData = {
            email: email,
            username: username,
            cpf: cpf,
            telefone: telefone,
            endereco: endereco
        };

        await userRef.set(userData);
        console.log('Dados do usuário armazenados com sucesso');
    }

    async retrieveUsuarioId(id) {
        const userRef = db.collection('cliente').doc(id);
        const doc = await userRef.get();

        if (!doc.exists) {
            return null;
        }

        return doc.data();
    }

    async retrieveUsuario(email) {
        const userRef = db.collection("cliente");
        const snapshot = await userRef.where('email', '==', email).get();

        if (snapshot.empty) {
            return null;
        }

        let id_procurando;

        snapshot.forEach(snap => {
            id_procurando = snap.id;
        });

        const userRef2 = db.collection("cliente").doc(id_procurando);
        const doc = await userRef2.get();

        if (!doc.exists) {
            return null;
        }

        return doc.data();
    }

    async atualizarUsuarioCliente(id, newData){
        const userRef = db.collection("cliente").doc(id);

        try{
            await userRef.set(newData, {merge: true});
            return {mensagem: "Dados atualizados com sucesso!"};
        }catch (error) {
            console.error("Erro ao atualizar informações", error);
            throw new Error('Erro ao atualizar informações: ' + error.message);
        }
    }

    // Empresa
    async add_usuario_empresa(email, username, cnpj, telefone, endereco, descricao, uid) {
    
        const empresaDocRef = db.collection("empresa").doc(uid);
    
        const empresaData = {
            email: email,
            username: username,
            cnpj: cnpj,
            descricao: descricao,
            endereco: endereco,
            telefone: telefone
        };

        await empresaDocRef.set(empresaData);
        console.log('Documento "empresa" adicionado com sucesso.');
    }

    async retrieveUsuarioEmpresaId(id){
        const userRef = db.collection('empresa').doc(id);
        const doc = await userRef.get();

        if(!doc.exists){
            throw new Error("Empresa não existe");
        }
        return doc.data();
    }

    async retrieveUsuarioEmpresa(email){
        const userRef = db.collection("empresa");
        const snapshot = await userRef.where('email', '==', email).get();

        if(snapshot.empty){
            return null;
        }

        let id_procurando;

        snapshot.forEach(snap =>{
            id_procurando = snap.id;
        });

        const userRef2 = db.collection("empresa").doc(id_procurando);
        const doc = await userRef2.get();

        if(!doc.exists){
            return null;
        }
        return doc.data();
    }

    async atualizarUsuarioEmpresa(id, newData) {
        const userRef = db.collection("empresa").doc(id);
    
        try {
            await userRef.set(newData, { merge: true });
            return { mensagem: 'Dados atualizados com sucesso!' };
        } catch (error) {
            console.error("Erro ao atualizar informações", error);
            throw new Error('Erro ao atualizar informações: ' + error.message);
        }
    }    
    
    // Pessoa Prestadora de Serviço
    async add_usuario_profissional(email, username, cpf, empresa, tipoServico, telefone, endereco, uid) {
    
        const profissionalDocRef = db.collection("profissional").doc(uid);
   
        const profissionalData = {
            email: email,
            username: username,
            cpf: cpf,
            empresa: empresa,
            tipoServico: tipoServico,
            endereco: endereco,
            telefone: telefone
        };
    
        await profissionalDocRef.set(profissionalData);
        console.log('Documento "profissional" adicionado com sucesso.');
    }  
    
    async retrieveProfissionalId(id){
        const userRef = db.collection("profissional").doc(id);
        const doc = await userRef.get();

        if(!doc.exists){
            return null;
        }
        return doc.data();
    }

    async retrieveProfissional(email){
        const userRef = db.collection("profissional");
        const snapshot = await userRef.where('email', '==', email).get();

        if(snapshot.empty){
            return null;
        }
        let id_procurando;

        snapshot.forEach(snap => {
            id_procurando = snap.id;
        });

        const userRef2 = db.collection("profissional").doc(id_procurando);
        const doc = await userRef2.get();

        if(!doc.exists){
            return null;
        }
        return doc.data();
    }

    async atualizarUsuarioProfissional(id, newData){
        const userRef = db.collection("profissional").doc(id);

        try{
            await userRef.set(newData, {merge: true});
            return { mensagem: 'Dados atualizados com sucesso!' };
        } catch (error) {
            console.error("Erro ao atualizar informações", error);
            throw new Error('Erro ao atualizar informações: ' + error.message);
        }
    }

    //Serviços
    async retrieveServico(id_procurando){
        id_procurando = id_procurando.replace(/\s/g, '');
        const servicoRef = db.collection("servico").doc(id_procurando);
        const doc = await servicoRef.get();

        if(!doc.exists){
            console.log("Serviço não existe.");
        }else{
            return doc.data();
        }
    }

    async retrieveAllServicos(uid){
        const servicoRef = db.collection("servico").doc(uid);
        const snapshot = await servicoRef.get();
        const servicos = [];
        snapshot.forEach(doc=>{
            servicos.push(doc.data());
        });
        return servicos;
    }

    async retrieveServicoId(id){
        const userRef = db.collection("servico").doc(id);
        const doc = await userRef.get();

        if(!doc.exists){
            return null;
        }
        return doc.data();
    }

    async atualizarServico(id, newData){
        const userRef = db.collection("servico").doc(id);

        try {
            await userRef.set(newData, { merge: true });
            return { mensagem: 'Dados atualizados com sucesso!' };
        } catch (error) {
            console.error("Erro ao atualizar informações", error);
            throw new Error('Erro ao atualizar informações: ' + error.message);
        }
    }

    //Cartão
    async retrieveCartao(clienteId) {
        try {
            const userRef = doc(db, "cliente", clienteId);
            console.log("userRef:", userRef);
    
            const cartaoRef = collection(userRef, "cartao");
            console.log("cartaoRef:", cartaoRef);
    
            const cartaoSnapshot = await getDocs(cartaoRef);
    
            if (cartaoSnapshot.empty) {
                console.log("Cartao not found.");
                return null;
            }
    
            const cartaoData = cartaoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Cartao data:", cartaoData); 
            return cartaoData;
        } catch (error) {
            console.error("Error retrieving cartao:", error);
            return null;
        }
    }
    
    //Agendamento
    async retrieveAgendamento(id){
        const userRef = db.collection("agendamento").doc(id);
        const doc = await userRef.get();

        if(!doc.exists){
            return null;
        }
        return doc.data();
    }

    async retrieveAllAgendamentos(id){
        const userRef = db.collection("agendamento").doc(id);
        const doc = await userRef.get();
        const agendamento = [];
        doc.forEach(doc => {
            agendamento.push(doc.data());
        });
        return agendamento;
    }

    async retrieveFavorito(id){
        const userRef = db.collection("favorito").doc(id);
        const doc = await userRef.get();
        
        if(!doc.exists){
            return null;
        }
        return doc.data();
    }

    async retrieveHorario(id) {
        const userRef = db.collection("horariosDisponiveis").doc(id);
        const doc = await userRef.get();

        if(!doc.exists){
            return null;
        }
        return doc.data();
    }


    //Exclusões
    async excluirConta(id){
        const useRef = db.collection("cliente").doc(id);
        await useRef.delete();
    }

    async excluirEmpresa(id){
        const userRef = db.collection("empresa").doc(id);

       await userRef.delete();
    }

    async excluirProfissional(id){
        const userRef = db.collection("profissional").doc(id);
        
        await userRef.delete();
    }

    async excluirCartao(id) {
        const userRef = db.collection("cliente").doc(id);
        const cartaoRef = userRef.collection("cartao");
    
        await deleteDoc(cartaoRef);
    }    
    

    async excluirServico(id){
        const userRef = db.collection("servico").doc(id);
        await userRef.delete();
    }

    async excluirFavorito(id) {
        const userRef = db.collection("favorito").doc(id);
        await userRef.delete();
    }

}

module.exports = Goservice