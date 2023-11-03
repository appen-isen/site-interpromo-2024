console.log("Backend sport start loading...");
import pb from './login.js'

const SportList = await pb.collection('sport').getFullList({});

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

const matchList = await pb.collection('match').getFullList({
    sort: '+heure_debut',
    expand: 'sport,team1,team2',
});

function selectWinner(orderedClassementList){
    if(orderedClassementList.length != 0){
        let firtClasse = orderedClassementList[0]
        if(firtClasse.classement === 1){
            return firtClasse.expand.team.name;
        } else {
            orderedClassementList.forEach(classe => {
                if(classe.classement === 1){
                    return classe.expand.team.name;
                }
            });
        }
    }
    return "";
}

function getSportWinningTeam(sport){
    switch(sport.name){
        case "basketball":
            return selectWinner(classBasketballList)
        case "volleyball":
            return selectWinner(classVoleyballList)
        case "football":
            return selectWinner(classFootballList)
        case "handball":
            return selectWinner(classHandballList)
        case "defi enduro":
            return selectWinner(classDefiList) //TODO
        case "badminton":
            return "" //TODO
    }
}

function getSportNextMatchText(sport){
    let match = "";
    matchList.forEach(matche => {
        if(matche.expand.sport.name === sport.name){
            match = matche;
        }
    });
    if(match === ""){
        return "Pas de match prévu";
    }
    const time_start = new Date(match.heure_debut);
    return "Prochain match : " + match.expand.team1.name + " vs " + match.expand.team2.name + " à " + time_start.getHours() + "h" + time_start.getMinutes();
}

function getSportCard(sport){
    let winner = getSportWinningTeam(sport)
    let title = winner === "" ? "La compétition n'a pas commencé" : ("Equipe en tête : " + winner)
    return `
    <div class="card my-3">
        <div class="card-header text-center bg-light-subtle text-emphasis-light">${sport.name.toUpperCase()}</div>
        <div class="card-body bg-light-subtle text-emphasis-light">
            <h5 class="card-title">${title}</h5>
        </div>
        <div class="card-footer bg-light-subtle text-emphasis-light">${getSportNextMatchText(sport)}</div>
    </div>`
}

const sportCardContainer = document.getElementById("sportContainer");
SportList.forEach(sport => {
    sportCardContainer.insertAdjacentHTML("beforeend", getSportCard(sport))
});


console.log("Backend sport loaded!");