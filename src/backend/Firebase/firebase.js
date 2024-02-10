import { initializeApp} from 'firebase/app';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    
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

