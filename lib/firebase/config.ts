import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyB3jar2IvtS-0zYqB7ZZ8HhPWq61WCspzU",
    authDomain: "campus-genie-a9ac8.firebaseapp.com",
    projectId: "campus-genie-a9ac8",
    storageBucket: "campus-genie-a9ac8.firebasestorage.app",
    messagingSenderId: "268899214368",
    appId: "1:268899214368:web:ad7f7fa11baba4e04ac845",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)

export { app, auth }
