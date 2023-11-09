console.log("Backend login start loading...");
import PocketBase from '../pocketbase.es.mjs'

const pb = new PocketBase("https://pocketbase.appen.fr");

//Connexion
if(window.location.href.includes("login.html")){
    const loginButton = document.querySelector('button[type="submit"]');

    loginButton.addEventListener('click', async function(event) {
        //Annulation du comportement par défaut
        event.preventDefault();

        //Récupération des données du formulaire
        const loginID = document.getElementById('LoginID').value;
        const loginPassword = document.getElementById('LoginPassword').value;

        try {
            //Tentative de connexion
            const authData = await pb.collection('users').authWithPassword(loginID, loginPassword);

            //Si la connexion est réussie, on redirige vers la page d'arbitrage
            if (pb.authStore.isValid) {
                window.location.href = "arbitrage.html";
            } else {
            }
        } catch (error) {
            //Si la connexion échoue, on affiche l'erreur dans la console
            console.error('Erreur d\'authentification :', error);
            //Affiche la div d'erreur d'authentification
            document.getElementById("LoginImposible").style.display = "block";
        }
    });
}

//Redirection vers la page d'arbitrage si l'utilisateur est déjà connecté
if(window.location.href.includes("login.html")){
    if(pb.authStore.isValid === true){
        window.location.href = "arbitrage.html";
    }
}

//Redirection vers la page de login si l'utilisateur n'est pas connecté
if(window.location.href.includes("arbitrage.html") || window.location.href.includes("arbimatch.html")){
    if(pb.authStore.isValid === false){
        window.location.href = "login.html";
    }
}


//Déconnexion
if (pb.authStore.isValid && window.location.href.includes("arbitrage.html") || window.location.href.includes("arbimatch.html")) {
    const logoutButton = document.getElementById('disconect');
    logoutButton.addEventListener('click', async function(event) {
        //Annulation du comportement par défaut
        event.preventDefault();
        //Déconnexion
        pb.authStore.clear();
        //Redirection vers la page de login
        window.location.href = "login.html";
    });
}

//Ajoute une deconnexion automatique au bout de 12 heures, a l'aide d'un cookie
if (pb.authStore.isValid && window.location.href.includes("arbitrage.html") || window.location.href.includes("arbimatch.html")) {
    //Si le cookie n'existe pas, on le crée
    if (document.cookie.indexOf("logout") === -1) {
        document.cookie = "logout=0; max-age=43200";
    }
    //Si le cookie existe, on le met à jour
    else {
        let cookie = document.cookie.split(";");
        let time = parseInt(cookie[0].split("=")[1], 10);
        time += 1;
        document.cookie = "logout=" + time + "; max-age=43200";
        //Si le cookie est supérieur à 12 heures, on déconnecte l'utilisateur
        if (time > 43200) {
            pb.authStore.clear();
            window.location.href = "login.html";
        }
    }
}


console.log("Backend login loaded!");

export default pb;