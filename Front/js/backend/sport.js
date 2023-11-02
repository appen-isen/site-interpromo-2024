console.log("Backend sport start loading...");
import pb from './login.js'

const SportList = await pb.collection('sport').getFullList({});

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

const matchList = await pb.collection('match').getFullList({
    sort: '+heure_debut',
    expand: 'sport,team1,team2',
});

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
    let equipe = "";
    if(sport.name === "basketball") {
        classBasketballList.forEach(classe => {
            if(classe.classement === 1){
                equipe = classe.expand.team.name;
            }
        });
    } else if(sport.name === "volleyball") {
        classVoleyballList.forEach(classe => {
            if(classe.classement === 1){
                equipe = classe.expand.team.name;
            }
        });
    } else if(sport.name === "football") {
        classFootballList.forEach(classe => {
            if(classe.classement === 1){
                equipe = classe.expand.team.name;
            }
        });
    } else if(sport.name === "handball") {
        classHandballList.forEach(classe => {
            if(classe.classement === 1){
                equipe = classe.expand.team.name;
            }
        });
    } else if(sport.name === "defi") {
        classDefiList.forEach(classe => {
            if(classe.classement === 1){
                equipe = classe.expand.team.name;
            }
        });
    }
    cardTitle.innerHTML = "Equipe en tête : " + equipe;
    cardBody.appendChild(cardTitle);
    card.appendChild(cardBody);
    //Affichage du prochain match
    const cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer', 'bg-light-subtle', 'text-emphasis-light');
    //Affichage du prochain match du sport
    let match = "";
    matchList.forEach(matche => {
        if(matche.expand.sport.name === sport.name){
            match = matche;
        }
    });
    if(match === ""){
        cardFooter.innerHTML = "Pas de match prévu";
        card.appendChild(cardFooter);
        sportCardContainer.appendChild(card);
        return;
    }
    const time_start = new Date(match.heure_debut);
    cardFooter.innerHTML = "Prochain match : " + match.expand.team1.name + " vs " + match.expand.team2.name + " à " + time_start.getHours() + "h" + time_start.getMinutes();
    card.appendChild(cardFooter);
    sportCardContainer.appendChild(card);
});


console.log("Backend sport loaded!");