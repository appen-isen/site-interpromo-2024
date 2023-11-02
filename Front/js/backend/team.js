console.log("Backend team start loading...");
import pb from './login.js'

const EquipeList = await pb.collection('equipes').getFullList({
    expand: 'promo,sport,membres',
});

const classBasketballList = await pb.collection('class_basketball').getFullList({
    expand: 'team',
});

const classVoleyballList = await pb.collection('class_voleyball').getFullList({
    expand: 'team',
});

const classFootballList = await pb.collection('class_football').getFullList({
    expand: 'team',
});

const classHandballList = await pb.collection('class_handball').getFullList({
    expand: 'team',
});

const classDefiList = await pb.collection('class_defi').getFullList({
    expand: 'team',
});

const PromoList = await pb.collection('promo').getFullList({
});

const matchList = await pb.collection('match').getFullList({
    sort: '+heure_debut',
    expand: 'team1,team2,sport',
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
            if(equipe.expand.sport.name === "basketball") {
                //Affichage du classement
                let classement = 0;
                classBasketballList.forEach(classe => {
                    if(classe.expand.team.name === equipe.name){
                        classement = classe.classement;
                    }
                });
                card.innerHTML += "Basketball : " + equipe.name + " : " + classement + "e <br> ";
            }
            else if(equipe.expand.sport.name === "football") {
                let classement = 0;
                classFootballList.forEach(classe => {
                    if(classe.expand.team.name === equipe.name){
                        classement = classe.classement;
                    }
                });
                cardText.innerHTML += "Football : " + equipe.name + " : " + classement + "e <br> ";
            }
            else if(equipe.expand.sport.name === "handball") {
                let classement = 0;
                classHandballList.forEach(classe => {
                    if(classe.expand.team.name === equipe.name){
                        classement = classe.classement;
                    }
                });
                cardText.innerHTML += "Handball : " + equipe.name + " : " + classement + "e <br> ";
            }
            else if(equipe.expand.sport.name === "volleyball") {
                let classement = 0;
                classVoleyballList.forEach(classe => {
                    if(classe.expand.team.name === equipe.name){
                        classement = classe.classement;
                    }
                });
                cardText.innerHTML += "Volleyball : " + equipe.name + " : " + classement + "e <br> ";
            }
            else if(equipe.expand.sport.name === "defi enduro"){
                let classement = 0;
                classDefiList.forEach(classe => {
                    if(classe.expand.team.name === equipe.name){
                        classement = classe.classement;
                    }
                });
                cardText.innerHTML += "Défi Enduro : " + equipe.name + " : " + classement + "e <br> ";
            }
            else if(equipe.expand.sport.name === "badminton"){
                cardText.innerHTML += "Badminton : " + equipe.name + " : " + "BACK A FAIRE" + "e <br> ";
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
    //Affichage du classement
    const cardClassement = document.createElement('p');
    cardClassement.classList.add('card-text');
    let classement = 0;
    if(equipe.expand.sport.name === "basketball") {
        classBasketballList.forEach(classe => {
            if(classe.expand.team.name === equipe.name){
                classement = classe.classement;
            }
        });
    }
    else if(equipe.expand.sport.name === "football") {
        classFootballList.forEach(classe => {
            if(classe.expand.team.name === equipe.name){
                classement = classe.classement;
            }
        });
    }
    else if(equipe.expand.sport.name === "handball") {
        classHandballList.forEach(classe => {
            if(classe.expand.team.name === equipe.name){
                classement = classe.classement;
            }
        });
    }
    else if(equipe.expand.sport.name === "volleyball") {
        classVoleyballList.forEach(classe => {
            if(classe.expand.team.name === equipe.name){
                classement = classe.classement;
            }
        });
    }
    else if(equipe.expand.sport.name === "defi enduro"){
        classDefiList.forEach(classe => {
            if(classe.expand.team.name === equipe.name){
                classement = classe.classement;
            }
        });
    }
    else if(equipe.expand.sport.name === "badminton"){
        classement = "BACK A FAIRE";
    }
    cardClassement.innerHTML += " Classement : " + classement +"e";
    //Suppression de la dernière virgule
    cardMember.innerHTML = cardMember.innerHTML.slice(0, -1);
    //Suppression du dernier espace
    cardMember.innerHTML = cardMember.innerHTML.slice(0, -1);
    //Affichage du prochain match
    const cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer', 'bg-light-subtle', 'text-emphasis-light');
    const nextMatch = matchList.find(match => match.expand.team1.name === equipe.name || match.expand.team2.name === equipe.name);
    const time_start = new Date(nextMatch.heure_debut);
    cardFooter.innerHTML = "Prochain match : " + nextMatch.expand.team1.name + " vs " + nextMatch.expand.team2.name + " à " + time_start.getHours() + "h" + time_start.getMinutes();

    cardBody.appendChild(cardText1);
    cardBody.appendChild(cardText2);
    cardBody.appendChild(cardClassement);
    cardBody.appendChild(cardMember);

    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);

    teamCardContainer.appendChild(card);
});


console.log("Backend team loaded!");