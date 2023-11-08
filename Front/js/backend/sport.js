console.log("Backend sport start loading...");
import pb from './login.js'

const SportList = await pb.collection('sport').getFullList({});

const EquipeList = await pb.collection('equipes').getFullList({
    expand: 'promo,sport',
});

const matchList = await pb.collection('match').getFullList({
    sort: '+heure_debut',
    expand: 'sport,team1,team2',
});

function getOrderedTableTeams(sport){
    let result = "";
    if(sport.tableau !== ""){
        result += `<h6 class="text-secondary-emphasis fw-semibold">${sport.tableau}</h6>`
    }
    if(sport.state === "waiting"){
        result += "<h5>La compétition n'a pas commencé</h5>"
        return result;
    }
    if(sport.type === "poules"){
        let teams = EquipeList.filter(equipe => equipe.sport === sport.id).sort((teamA, teamB) => teamA.classement - teamB.classement)
        result += `<h5 class="d-flex justify-content-between align-items-start">${teams[0].name}<span class="badge bg-warning text-black rounded-pill">${teams[0].points} pts</span></h5>`
        for(let i = 1; i < teams.length; i++){
            let color = ""
            if(teams[i].classement <= sport.qualified){
                color = "bg-success"
            } else {
                color = "bg-danger"
            }
            result += `<div class="d-flex justify-content-between align-items-start">${teams[i].classement}e : ${teams[i].name}<span class="badge ${color} rounded-pill">${teams[i].points} pts</span></div>`
        }
        return result
    } else if (sport.type === "tournois"){
        let teams = EquipeList.filter(equipe => equipe.expand.sport.name === sport.name && equipe.stade !== '').sort((teamA, teamB) => parseInt(teamA.stade, 10) - parseInt(teamB.stade, 10))
        for(let i = 0; i < teams.length; i++){
            let stade;
            switch(teams[i].stade){
                case "16":
                    stade = "16èmes"
                    break;
                case "8":
                    stade = "8èmes"
                    break;
                case "4":
                    stade = "Quarts"
                    break;
                case "2":
                    stade = "Demies"
                    break;
                case "1":
                    stade = "Finale"
                    break;
            }
            let color = ""
            if(teams[i].eliminated){
                color = "bg-danger"
            } else {
                color = "bg-success"
            }
            result += `<div class="d-flex justify-content-between align-items-start">${teams[i].name}<span class="badge ${color} rounded-pill">${stade}</span></div>`
        }
        return result
    }
}

function getSportNextMatchText(sport){
    let match = matchList.find(matche => matche.expand.sport.name === sport&& matche.status === "waiting");
    if(!match){
        return "Pas de match prévu";
    }
    const time_start = new Date(match.heure_debut);
    return "Prochain match : " + match.expand.team1.name + " vs " + match.expand.team2.name + ' ' + time_start.toLocaleString('fr', { weekday: 'long' }) +  " à " +  time_start.toLocaleString('fr', { hour: 'numeric', minute: 'numeric' });
}

function getSportIcon(sport){
    switch(sport) {
        case "basketball":
            return ` <span class="material-symbols-outlined">sports_basketball</span>`
        case "volleyball":
            return ` <span class="material-symbols-outlined">sports_volleyball</span>`
        case "football":
            return ` <span class="material-symbols-outlined">sports_soccer</span>`
        case "handball":
            return ` <span class="material-symbols-outlined">sports_handball</span>`
        case "badminton":
            return ` <img src="assets/shuttlecock.svg" alt="shuttlecock" width="24" height="24">`
    }
}

function getSportCard(sportName){
    let listeTableau = SportList.filter(sport => sport.name === sportName);
    let result =  `
    <div class="card my-3">
        <div class="card-header text-center bg-light-subtle text-emphasis-light"><div class="d-flex justify-content-evenly">${getSportIcon(sportName)}${sportName.toUpperCase()}${getSportIcon(sportName)}</div></div>
        <div class="card-body bg-light-subtle text-emphasis-light">`
        result += getOrderedTableTeams(listeTableau[0])
        for(let i = 1; i < listeTableau.length; i++){
            result += "<hr>"
            result += getOrderedTableTeams(listeTableau[i])
        }
        result += `</div>
        <div class="card-footer bg-light-subtle text-emphasis-light">${getSportNextMatchText(sportName)}</div>
    </div>`
    return result;
}

const sportCardContainer = document.getElementById("sportContainer");
let sportsList = SportList.reduce((accumulator, currentValue) => {
    if(!(accumulator.some(elem => elem === currentValue.name))){
        accumulator.push(currentValue.name);
    }
    return accumulator;
}, [])
sportsList.forEach(sportName => {
    sportCardContainer.insertAdjacentHTML("beforeend", getSportCard(sportName))
});


console.log("Backend sport loaded!");