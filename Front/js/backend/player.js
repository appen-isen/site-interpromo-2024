/*
console.log("Backend player start loading...");
import pb from './login.js'

//Gestion de l'ajout d'un joueur
if (window.location.href.includes("arbitrage.html")) {
    const promotions = await pb.collection('promo').getFullList({});
    const promoSelect = document.getElementById('promo');

    // Remplir dynamiquement les options de promo
    const promoOptions = promotions.map(promo => `<option id="${promo.id}" value="${promo.id}">${promo.name}</option>`).join('');
    promoSelect.innerHTML = promoOptions;


    const playerAddForm = document.getElementById('addPlayerForm');
    playerAddForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        console.log("YAGBDHJA?.DADQ");
    });
}

console.log("Backend match loaded!");
*/