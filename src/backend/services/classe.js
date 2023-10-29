const admin = require('firebase-admin');

const serviceAccount = require('../Firebase/key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

db = admin.firestore();

let Goservice = class {
    constructor(){
        this.servicos = []
    }

    add_usuario(email, username, cpf, telefone, endereco, uid){
        db.collection('cliente').doc(uid).set({
            email: email,
            username: username,
            cpf: cpf,
            telefone: telefone,
            endereco: endereco
        });
        console.log('chegou add_usuario')
    }

    add_usuario_empresa(email, username, cnpj, telefone, endereco, descricao, uid){
        db.collection('empresa').doc(uid).set({
            email:email,
            username:username,
            cnpj:cnpj,
            descricao: descricao,
            endereco: endereco,
            telefone: telefone
        });
        console.log('chegou add_empresa')
    }

    add_usuario_profissional(email, username, cpf, empresa, tipoServico, telefone, endereco, uid){
        db.collection('profissional').doc(uid).set({
            email:email,
            username:username,
            cpf:cpf,
            empresa: empresa,
            tipoServico: tipoServico,
            endereco: endereco,
            telefone: telefone
        });
        console.log('chegou add_profissional');
    }

    async retrieveUsuarioId(id){
        const userRef = db.collection('cliente').doc(id);
        const doc = await userRef.get();

        if(!doc.exists){
            throw new Error("Não existe");
        }
        return doc.data();
    }

    async retrieveUsuario(email){
        console.log('email: ' + email)
        const userRef = db.collection('cliente');
        const snapshot = await userRef.where('email', '==', email).get();

        if(snapshot.empty){
            throw new Error("Não existe");
        }

        var id_procurando

        snapshot.forEach(snap =>{
            id_procurando = snap.id;
        });

        const userRef2 = db.collection('cliente').doc(id_procurando);
        const doc = await userRef2.get();

        if(!doc.exists){
            throw new Error("Não existe");
        }
        return doc.data();
    }
}

module.exports = Goservice