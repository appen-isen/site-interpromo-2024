console.log("Backend team start loading...");
import pb from './login.js'

const EquipeList = await pb.collection('equipes').getFullList({
    expand: 'promo,sport,membres',
});

const classBasketballList = await pb.collection('class_basketball').getFullList({
    sort: '+classement',
    expand: 'team',
});

const classVoleyballList = await pb.collection('class_voleyball').getFullList({
    sort: '+classement',
    expand: 'team',
});

const classFootballList = await pb.collection('class_football').getFullList({
    sort: '+classement',
    expand: 'team',
});

const classHandballList = await pb.collection('class_handball').getFullList({
    sort: '+classement',
    expand: 'team',
});

const classDefiList = await pb.collection('class_defi').getFullList({
    sort: '+classement',
    expand: 'team',
});

const PromoList = await pb.collection('promo').getFullList({
});

const matchList = await pb.collection('match').getFullList({
    sort: '+heure_debut',
    expand: 'team1,team2,sport',
});

function findClassementInClassementList(classementList, equipe){
    if(classementList.length != 0){
        classementList.forEach(classe => {
            if (classe.expand.team.name === equipe.name) {
                return classe.classement;
            }
        });
    }
    return 0;
}

function getTeamClassement(equipe){
    switch(equipe.expand.sport.name){
        case "football":
            return findClassementInClassementList(classFootballList, equipe);
        case "handball":
            return findClassementInClassementList(classHandballList, equipe);
        case "volleyball":
            return findClassementInClassementList(classVoleyballList, equipe);
        case "basketball":
            return findClassementInClassementList(classBasketballList, equipe);
        case "badminton":
            return 0;
        case "defi enduro":
            return findClassementInClassementList(classDefiList, equipe);
    }
}

function getTeamRow(equipe){
    let result =  `
    <li class="list-group-item d-flex justify-content-between align-items-start">
        <div class="ms-2 me-auto">
            <div class="fw-bold">${equipe.expand.sport.name}</div>
            ${equipe.name}
        </div>`
    let classement = getTeamClassement(equipe);
    if(classement != 0){
        result += `<span class="badge bg-primary rounded-pill">${classement}/...</span>`
    }
    result += `</li>`
    return result
}

function getPromoCard(promo, teamsList){
    let cardHtml = `
    <div class="card my-3">
        <div class="card-header text-center bg-light-subtle text-emphasis-light">${promo.name}</div>
        <ul class="list-group list-group-flush list-group-item">
    `
    teamsList.forEach(equipe => {
        cardHtml += getTeamRow(equipe)
    })
    cardHtml += `</ul>`
    const nextMatch = matchList.find(match => match.expand.team1.promo === promo.id || match.expand.team2.promo === promo.id);
    if(nextMatch){
        const time_start = new Date(nextMatch.heure_debut);
        cardHtml += `<div class="card-footer bg-light-subtle text-emphasis-light">Prochain match : ${nextMatch.expand.team1.name} vs ${nextMatch.expand.team2.name} à ${time_start.getHours()}h${time_start.getMinutes()}</div>`    
    }
    cardHtml += `</div>`
    return cardHtml
}

function getSportRow(equipe){
    console.log(equipe)
    let members = `Membres : ${equipe.capitaine} ,`;
    equipe.membres.forEach(membre => {
        members += membre.name + " ,";
    });
    console.log(members)
    members = members.slice(0, -2)
    let result =  `
    <li class="list-group-item d-flex justify-content-between align-items-start">
        <div class="ms-2 me-auto">
            <div class="fw-bold">${equipe.expand.sport.name}</div>
            ${members}
        </div>`
    let classement = getTeamClassement(equipe);
    if(classement != 0){
        result += `<span class="badge bg-primary rounded-pill">${classement}/...</span>`
    }
    result += `</li>`
    return result
}

function getTeamCard(teamBySport){
    let equipe = teamBySport['team']
    let cardHtml = `
    <div class="card my-3">
        <div class="card-header text-center bg-light-subtle text-emphasis-light">${equipe.name}(${equipe.expand.promo.name})</div>
        <ul class="list-group list-group-flush list-group-item">
    `
    for(const [sportName, team] of Object.entries(teamBySport).filter(([sportName, team]) => sportName != "team")){
        cardHtml += getSportRow(team)
    }
    cardHtml += `</ul>`
    const nextMatch = matchList.find(match => match.expand.team1.name === equipe.name || match.expand.team2.name === equipe.name);
    if(nextMatch){
        const time_start = new Date(nextMatch.heure_debut);
        cardHtml += `<div class="card-footer bg-light-subtle text-emphasis-light">Prochain match : ${nextMatch.expand.team1.name} vs ${nextMatch.expand.team2.name} à ${time_start.getHours()}h${time_start.getMinutes()}</div>`    
    }
    cardHtml += `</div>`
    return cardHtml
}

const promoCardContainer = document.getElementById("promoCardContainer");
const teamCardContainer = document.getElementById("teamCardContainer");

const promoTeams = {} // Object key = promo name, value = array of promo teams objects
const teamSports = {} // Object key = team name, value = Object key = sport name, value = team object

EquipeList.forEach(equipe => {
    if(!(equipe.expand.promo.name in promoTeams)){
        promoTeams[equipe.expand.promo.name] = [];
    }
    promoTeams[equipe.expand.promo.name].push(equipe);
    if(!(equipe.name in teamSports)){
        teamSports[equipe.name] = {'team': equipe};
    }
    teamSports[equipe.name][equipe.expand.sport.name] = equipe;
})

//Affichage des équipes par promo
PromoList.forEach(promo => {
    if(!(promo.name in promoTeams)){
        promoTeams[promo.name] = []
    }
    promoCardContainer.insertAdjacentHTML("beforeend", getPromoCard(promo, promoTeams[promo.name]));
});

Object.values(teamSports).forEach(teamBySport => {
    teamCardContainer.insertAdjacentHTML("beforeend", getTeamCard(teamBySport))
})

console.log("Backend team loaded!");