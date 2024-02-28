import { initializeApp} from 'firebase/app';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAjWrDAR_DACdqhq2P7nfnYI4H6M0YkX50",
    authDomain: "goservices-a0bf9.firebaseapp.com",
    databaseURL: "https://goservices-a0bf9-default-rtdb.firebaseio.com",
    projectId: "goservices-a0bf9",
    storageBucket: "goservices-a0bf9.appspot.com",
    messagingSenderId: "966186778726",
    appId: "1:966186778726:web:31e6300c46c447d03cada7",
    measurementId: "G-H7L211LBSZ"
};

const appF = initializeApp(firebaseConfig);
const auth = getAuth(appF);
const database = getDatabase(appF);
const analytics = getAnalytics(appF);

onAuthStateChanged(auth, (user)=>{
    if(user){
        console.log('Usuário autentificado', user);
    }else{
        console.log('Modo visitante.');
    }
})

export { appF, auth, database, analytics };

