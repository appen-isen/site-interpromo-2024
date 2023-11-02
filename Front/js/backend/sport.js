console.log("Backend sport start loading...");
import pb from './login.js'

const SportList = await pb.collection('sport').getFullList({});

const sportCardContainer = document.getElementById("sportContainer");
SportList.forEach(sport => {
    //Création de la carte
    const card = document.createElement('div');
    card.classList.add('card', 'my-3');
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header', 'text-center', 'bg-light-subtle', 'text-emphasis-light');
    //Affichage du nom du sport en majuscule
    cardHeader.innerHTML = sport.name.toUpperCase();
    card.appendChild(cardHeader);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'bg-light-subtle', 'text-emphasis-light');
    //Affichage de l'équipe en tête
    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.innerHTML = "En tête : " + "BACK A FAIRE";
    cardBody.appendChild(cardTitle);
    card.appendChild(cardBody);
    //Affichage du prochain match
    const cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer', 'bg-light-subtle', 'text-emphasis-light');
    cardFooter.innerHTML = "Prochain match : " + "BACK A FAIRE";
    card.appendChild(cardFooter);
    sportCardContainer.appendChild(card);
});


console.log("Backend sport loaded!");