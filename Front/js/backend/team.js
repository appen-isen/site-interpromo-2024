console.log("Backend team start loading...");
import pb from './login.js'

const EquipeList = await pb.collection('equipes').getFullList({
    expand: 'promo,sport',
});

const PromoList = await pb.collection('promo').getFullList({
});

const promoCardContainer = document.getElementById("promoCardContainer");
PromoList.forEach(promo => {
    const card = document.createElement('div');
    card.classList.add('card', 'my-3');
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header', 'text-center', 'bg-light-subtle', 'text-emphasis-light');
    cardHeader.innerHTML = promo.name;
    card.appendChild(cardHeader);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'bg-light-subtle', 'text-emphasis-light');
    const cardText = document.createElement('p');
    EquipeList.forEach(equipe => {
        if(equipe.expand.promo.name === promo.name){
            cardText.innerHTML += equipe.expand.sport.name + ": " + equipe.name + " (" + "CLASSEMENT A REMPLACER PAR LE BACK QUAND IL SERA FAIT" + ")" + "<br>";
        }
    });
    cardBody.appendChild(cardText);
    card.appendChild(cardBody);
    promoCardContainer.appendChild(card);
});


const teamCardContainer = document.getElementById("teamCardContainer");
EquipeList.forEach(equipe => {
    const card = document.createElement('div');
    card.classList.add('card', 'my-3');

    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header', 'text-center', 'bg-light-subtle', 'text-emphasis-light');
    cardHeader.innerHTML = equipe.name;

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'bg-light-subtle', 'text-emphasis-light');

    const cardText1 = document.createElement('h5');
    cardText1.classList.add('card-title');
    cardText1.innerHTML = "Sport : " + equipe.expand.sport.name;


    const cardText2 = document.createElement('p');
    cardText2.classList.add('card-text');
    cardText2.innerHTML = "Promo : " + equipe.expand.promo.name;

    const cardMember = document.createElement('p');
    cardMember.classList.add('card-text');
    cardMember.innerHTML = "Membres : " + equipe.capitaine + ", " + equipe.membres;

    const cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer', 'bg-light-subtle', 'text-emphasis-light');
    cardFooter.innerHTML = "Prochain match : " + equipe.nextMatch;

    cardBody.appendChild(cardText1);
    cardBody.appendChild(cardText2);
    cardBody.appendChild(cardMember);

    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);

    teamCardContainer.appendChild(card);
});


console.log("Backend team loaded!");