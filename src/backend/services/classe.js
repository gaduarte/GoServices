const admin = require('firebase-admin');

const serviceAccount = require('../Firebase/key.json');

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

}

module.exports = Goservice