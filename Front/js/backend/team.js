console.log("Backend team start loading...");
import pb from './login.js'

const EquipeList = await pb.collection('equipes').getFullList({
    expand: 'promo,sport,membres,capitaine',
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

function getTeamRow(equipe){
    let result =  `
    <li class="list-group-item d-flex justify-content-between align-items-start">
        <div class="ms-2 me-auto">
            <div class="fw-bold">${equipe.expand.sport.name}</div>
            ${equipe.name}
        </div>`
    if(equipe.classement != 0){
        result += `<span class="badge bg-primary rounded-pill">${equipe.classement}/${numOfTeamsBySport[equipe.expand.sport.name]}</span>`
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
        cardHtml += `<div class="card-footer bg-light-subtle text-emphasis-light">Prochain match : <b>${nextMatch.expand.sport.name}</b> ${nextMatch.expand.team1.name} vs ${nextMatch.expand.team2.name} ${time_start.toLocaleString('fr', { weekday: 'long' })} à ${time_start.toLocaleString('fr', { hour: 'numeric', minute: 'numeric' })}</div>`    
    }
    cardHtml += `</div>`
    return cardHtml
}

function getSportRow(equipe){
    let members = ""
    if(equipe.capitaine != ""){
        members += `<u>${equipe.expand.capitaine.prenom} ${equipe.expand.capitaine.name}</u>, `;
    }
    if(equipe.membres.length !== 0){
        equipe.expand.membres.forEach(membre => {
            members += `${membre.prenom[0]}. ${membre.name}, `;
        });
        console.log(members)
        members = members.slice(0, -2)
    } else {
        members = "non renseignés"
    }
    let result =  `
    <li class="list-group-item d-flex justify-content-between align-items-start">
        <div class="ms-2 me-auto">
            <div class="fw-bold">${equipe.expand.sport.name}</div>
            Membres : ${members}
        </div>`
    if(equipe.classement != 0){
        result += `<span class="badge bg-primary rounded-pill">${equipe.classement}/${numOfTeamsBySport[equipe.expand.sport.name]}</span>`
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
        cardHtml += `<div class="card-footer bg-light-subtle text-emphasis-light">Prochain match : <b>${nextMatch.expand.sport.name}</b> ${nextMatch.expand.team1.name} vs ${nextMatch.expand.team2.name} ${time_start.toLocaleString('fr', { weekday: 'long' })} à ${time_start.toLocaleString('fr', { hour: 'numeric', minute: 'numeric' })}</div>`    
    }
    cardHtml += `</div>`
    return cardHtml
}

const promoCardContainer = document.getElementById("promoCardContainer");
const teamCardContainer = document.getElementById("teamCardContainer");

const promoTeams = {} // Object key = promo name, value = array of promo teams objects
const teamSports = {} // Object key = team name, value = Object key = sport name, value = team object
const numOfTeamsBySport = {}

EquipeList.forEach(equipe => {
    if(!(equipe.expand.promo.name in promoTeams)){
        promoTeams[equipe.expand.promo.name] = [];
    }
    promoTeams[equipe.expand.promo.name].push(equipe);
    if(!(equipe.name in teamSports)){
        teamSports[equipe.name] = {'team': equipe};
    }
    teamSports[equipe.name][equipe.expand.sport.name] = equipe;
    if(!(equipe.expand.sport.name in numOfTeamsBySport)){
        numOfTeamsBySport[equipe.expand.sport.name] = 0
    }
    numOfTeamsBySport[equipe.expand.sport.name] += 1
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