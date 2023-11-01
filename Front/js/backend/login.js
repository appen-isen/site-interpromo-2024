console.log("Backend login start loading...");
import PocketBase from '../pocketbase.es.mjs'

const pb = new PocketBase("http://[2a01:e0a:83b:6aa0:4c08:83ff:fe64:8ee0]:8090");

if(window.location.href.includes("login.html")){
    const loginButton = document.querySelector('button[type="submit"]');

    loginButton.addEventListener('click', async function(event) {
        event.preventDefault();

        const loginID = document.getElementById('LoginID').value;
        const loginPassword = document.getElementById('LoginPassword').value;

        try {
            const authData = await pb.collection('users').authWithPassword(loginID, loginPassword);

            if (pb.authStore.isValid) {
                console.log('Le token est valide.');
                window.location.href = "arbitrage.html";
            } else {
                console.log('Le token n\'est pas valide.');
            }
        } catch (error) {
            console.error('Erreur d\'authentification :', error);
            //Affiche la div d'erreur d'authentification
            document.getElementById("LoginImposible").style.display = "block";
        }
    });
}

if(window.location.href.includes("login.html")){
    if(pb.authStore.isValid === true){
        window.location.href = "arbitrage.html";
    }
}


if (pb.authStore.isValid && window.location.href.includes("arbitrage.html") || window.location.href.includes("arbimatch.html")) {
    const logoutButton = document.getElementById('disconect');
    logoutButton.addEventListener('click', async function(event) {
        event.preventDefault();
        pb.authStore.clear();
        window.location.href = "login.html";
    });
}

if(window.location.href.includes("arbitrage.html") || window.location.href.includes("arbimatch.html")){
    if(pb.authStore.isValid === false){
        window.location.href = "login.html";
    }
}


console.log("Backend login loaded!");

export default pb;