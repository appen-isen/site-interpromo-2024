console.log("Backend team start loading...");
import pb from './login.js'

const EquipeList = await pb.collection('equipes').getFullList({
    expand: 'promo,sport,membres',
});

const PromoList = await pb.collection('promo').getFullList({
});

const promoCardContainer = document.getElementById("promoCardContainer");

//Affichage des équipes par promo
PromoList.forEach(promo => {
    const card = document.createElement('div');
    card.classList.add('card', 'my-3');
    //Affichage du nom de la promo
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header', 'text-center', 'bg-light-subtle', 'text-emphasis-light');
    cardHeader.innerHTML = promo.name;
    card.appendChild(cardHeader);
    //Affichage des équipes de la promo
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'bg-light-subtle', 'text-emphasis-light');
    const cardText = document.createElement('p');
    //Pour chaque équipe, verif si elle est dans la promo et affichage du sport et du nom de l'équipe et du classement
    EquipeList.forEach(equipe => {
        if(equipe.expand.promo.name === promo.name){
            console.log(equipe.expand.sport.name);
            if(equipe.expand.sport.name === "basketball") {
                cardText.innerHTML += "Basketball : " + equipe.name + " : " + "BACK A FAIRE" + " <br> ";
            }
            else if(equipe.expand.sport.name === "football") {
                cardText.innerHTML += "Football : " + equipe.name + " : " + "BACK A FAIRE" + " <br> ";
            }
            else if(equipe.expand.sport.name === "handball") {
                cardText.innerHTML += "Handball : " + equipe.name + " : " + "BACK A FAIRE" + " <br> ";
            }
            else if(equipe.expand.sport.name === "volleyball") {
                cardText.innerHTML += "Volleyball : " + equipe.name + " : " + "BACK A FAIRE" + " <br> ";
            }
            else if(equipe.expand.sport.name === "defi enduro"){
                cardText.innerHTML += "Defi Enduro : " + equipe.name + " : " + "BACK A FAIRE" + " <br> ";
            }
            else if(equipe.expand.sport.name === "badminton"){
                cardText.innerHTML += "Badminton : " + equipe.name + " : " + "BACK A FAIRE" + " <br> ";
            }
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
    //Affichage du nom de l'équipe
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header', 'text-center', 'bg-light-subtle', 'text-emphasis-light');
    cardHeader.innerHTML = equipe.name;
    //Affichage des infos de l'équipe
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'bg-light-subtle', 'text-emphasis-light');
    //Affichage du sport
    const cardText1 = document.createElement('h5');
    cardText1.classList.add('card-title');
    cardText1.innerHTML = "Sport : " + equipe.expand.sport.name;
    //Affichage de la promo
    const cardText2 = document.createElement('p');
    cardText2.classList.add('card-text');
    cardText2.innerHTML = "Promo : " + equipe.expand.promo.name;
    //Affichage des membres
    const cardMember = document.createElement('p');
    cardMember.classList.add('card-text');
    cardMember.innerHTML = "Membres : " + equipe.capitaine + " ,";
    equipe.expand.membres.forEach(membre => {
        cardMember.innerHTML += " " + membre.name + " ,";
    });
    //Suppression de la dernière virgule
    cardMember.innerHTML = cardMember.innerHTML.slice(0, -1);
    //Suppression du dernier espace
    cardMember.innerHTML = cardMember.innerHTML.slice(0, -1);
    //Affichage du prochain match
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