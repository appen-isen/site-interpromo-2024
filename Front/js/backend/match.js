console.log("Backend match start loading...");
import pb from './login.js'

let matchList = await pb.collection('match').getFullList({
    sort: '+heure_debut',
    expand: 'team1,team2,sport',
});

//Check if navigator supports notifications
if (!("Notification" in window)) {
    console.error("Ce navigateur ne supporte pas les notifications desktop");
} else {
    //Ask for notifications permission on page load
    window.addEventListener('load', function () {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    });
}

const equipeList = await pb.collection('equipes').getFullList({});

const sportList = await pb.collection('sport').getFullList({});

//Gestion des mises à jour en temps réel des matchs
matchList.forEach(match => {
    //Si le match est en cours
    if (match.status === "in_progress" || match.status === "waiting") {
        //Abonnement au match
        pb.collection('match').subscribe(match.id, async function (e) {
            console.log(`Match ${match.id} updated`);
            //Si le match a été mis à jour
            if (e.action === "update") {
                //Mise à jour des points
                if (e.record.point1 !== match.point1) {
                    if (!document.getElementById("cardHeader" + match.id).classList.contains("text-warning-emphasis")) {
                        document.getElementById("cardHeader" + match.id).classList.add("text-warning-emphasis");
                    }
                    document.getElementById("pointT1" + match.id).innerHTML = e.record.point1;
                    match.point1 = e.record.point1
                    newGoalAlert(match, "team1")
                }
                if (e.record.point2 !== match.point2) {
                    if (!document.getElementById("cardHeader" + match.id).classList.contains("text-warning-emphasis")) {
                        document.getElementById("cardHeader" + match.id).classList.add("text-warning-emphasis");
                    }
                    document.getElementById("pointT2" + match.id).innerHTML = e.record.point2;
                    match.point2 = e.record.point2
                    newGoalAlert(match, "team2")
                }
                if (e.record.status === "in_progress") {
                    document.getElementById("cardHeader" + match.id).classList.remove("text-primary-emphasis");
                    document.getElementById("cardHeader" + match.id).classList.add("text-warning-emphasis");
                    document.getElementById("cardFooter" + match.id).classList.remove("text-primary-emphasis");
                    document.getElementById("cardFooter" + match.id).classList.add("text-warning-emphasis");
                    document.getElementById("cardFooter" + match.id).innerHTML = "Match en cours";
                    document.getElementById("cardHeader" + match.id).innerHTML = `
                        <div class="d-flex justify-content-evenly">
                            <p id="pointT1${match.id}">${match.point1}</p>
                            <p>-</p>
                            <p id="pointT2${match.id}">${match.point2}</p>
                        </div>
                    `;
                    if (match.expand.sport.name === "badminton" || match.expand.sport.name === "volleyball") {
                        document.getElementById(`pointT1${match.id}`).innerText = `${match.point1} (${match.set1})`;
                        document.getElementById(`pointT2${match.id}`).innerText = `${match.point2} (${match.set2})`;
                    }
                }
                //Mise à jour du statut si le match est terminé
                if (e.record.status === "finished") {
                    document.getElementById("cardHeader" + match.id).classList.remove("text-warning-emphasis");
                    document.getElementById("cardHeader" + match.id).classList.add("text-success-emphasis");
                    document.getElementById("cardFooter" + match.id).classList.remove("text-warning-emphasis");
                    document.getElementById("cardFooter" + match.id).classList.add("text-success-emphasis");
                    document.getElementById("cardFooter" + match.id).innerHTML = "Match terminé";
                    //Déplace le match dans la div des matchs terminés
                    const card = document.getElementById("card" + match.id);
                    card.remove();
                    const container = document.getElementById('cardContainer2');
                    container.appendChild(card);
                    matchEndAlert(match);
                }
                if (e.record.set1 !== match.set1 || e.record.set2 !== match.set2) {
                    newSetAlert(match);
                }
            }
        });
    }
});

//Affichage des matchs sur la page d'arbitrage
if (window.location.href.includes("arbitrage.html")) {
    //Affichage des matchs
    matchList.forEach(record => {
        let container = document.getElementById('cardContainer');
        const cardHTML = `
            <div class="card my-3">
                <div class="card-header text-center bg-light-subtle text-emphasis-light">
                    ${new Date(record.heure_debut).toLocaleString()}
                </div>
                <div class="card-body bg-light-subtle text-emphasis-light">
                    ${record.team1 && record.team2 ? `<h5 class="card-title text-center">${record.expand.team1.name} VS ${record.expand.team2.name}</h5>` : ''}
                    <p class="card-text text-center text-capitalize mb-0">${record.expand.sport.name}</p>
                    ${record.name !== "" ? `<p class="card-text text-center fw-semibold text-body-secondary">${record.name}</p>` : ''}
                    <div class="text-center">
                        <a class="btn ${record.status === "waiting" ? "btn-primary" : record.status === "in_progress" ? "btn-warning" : record.status === "finished" ? "btn-success" : "btn-secondary"} mt-2">
                            ${record.status === "waiting" ? "Démarrer et arbitrer ce match" : record.status === "in_progress" ? "Arbitrer ce match" : record.status === "finished" ? "Match terminé" : "Erreur de statut"}
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

//Gestion des informations dans la modal
if (window.location.href.includes("arbitrage.html")) {
    const modalHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Ajouter un match</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="addMatchForm">
                        <div class="mb-3">
                            <label for="equipe1" class="form-label">Equipe 1</label>
                            <select class="form-control" id="equipe1">
                                ${equipeList.map(equipe => `<option>${equipe.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="equipe2" class="form-label">Equipe 2</label>
                            <select class="form-control" id="equipe2">
                                ${equipeList.map(equipe => `<option>${equipe.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="sport" class="form-label">Sport</label>
                            <select class="form-control" id="sport">
                                ${sportList.map(sport => `<option>${sport.name} (${sport.tableau})</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="date" class="form-label">Date</label>
                            <input type="date" class="form-control" id="date">
                        </div>
                        <div class="mb-3">
                            <label for="time" class="form-label">Heure</label>
                            <input type="time" class="form-control" id="time">
                        </div>
                        <button type="submit" class="btn btn-primary">Ajouter ce match</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalAddMatch').innerHTML = modalHTML;
}

//Gestion de l'ajout d'un match
if (window.location.href.includes("arbitrage.html")) {
    const addMatchForm = document.getElementById('addMatchForm');
    addMatchForm.addEventListener('submit', async function (event) {
        //Empêche le rechargement de la page
        event.preventDefault();

        //Récupération des données du formulaire
        let equipe1 = document.getElementById('equipe1').value;
        //Récupération de l'id de l'équipe
        equipe1 = equipeList.find(equipe => equipe.name === equipe1);
        let equipe2 = document.getElementById('equipe2').value;
        equipe2 = equipeList.find(equipe => equipe.name === equipe2);
        let sportID = document.getElementById("sport").value;
        //Récupération de l'id du sport
        sportID = sportList.find(sport => sport.name === sportID);
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        //Création de la date de début du match
        const time_start = new Date(date + " " + time + ":00.000Z");
        //Décalage de l'heure de début de 1h pour la gestion du fuseau horaire
        time_start.setHours(time_start.getHours() - 1);
        let currentMode = "";
        if (sportID.name === "badminton") {
            currentMode = "tournoi";
        } else {
            currentMode = "poules"
        }
        const data = {
            "team1": equipe1.id,
            "team2": equipe2.id,
            "sport": sportID.id,
            "heure_debut": time_start.toISOString(),
            "point1": 0,
            "point2": 0,
            "mode": currentMode,
            "status": "waiting",
        };

        try {
            //Ajout du match
            await pb.collection('match').create(data);
            //Rechargement de la page
            window.location.href = "arbitrage.html";
        } catch (error) {
            //Affichage de l'erreur dans la console
            console.error('Erreur d\'ajout du match :', error);
        }
    });
}

const association = [];

//Gestion de la modal de supression d'un match
if (window.location.href.includes("arbitrage.html")) {
    const delMatchHTML = `
        <label for="matchdel" class="form-label">Match à supprimer</label>
        <select class="form-control" id="matchdel">
            ${matchList.map(record => {
                const time_start = new Date(record.heure_debut);
                const title = record.team1 && record.team2 ? `${record.expand.team1.name} VS ${record.expand.team2.name} - ${record.expand.sport.name} - ${time_start.toLocaleString()}` : `${record.name} - ${record.expand.sport.name} - ${time_start.toLocaleString()}`;
                association.push({ "title": title, "id": record.id });
                return `<option>${title}</option>`;
            }).join('')}
        </select>
    `;
    document.getElementById('matchdelJS').innerHTML = delMatchHTML;
}

//Gestion de la supression d'un match
if (window.location.href.includes("arbitrage.html")) {
    //Récupération du formulaire
    const delMatchForm = document.getElementById('delMatchForm');
    delMatchForm.addEventListener('submit', async function (event) {
        //Empêche le rechargement de la page
        event.preventDefault();

        //Récupération du nom du match
        let matchID = document.getElementById('matchdel').value;
        //Récupération de l'id du match dans l'association grace au nom du match
        matchID = association.find(match => match.title === matchID);
        try {
            //Supression du match
            await pb.collection('match').delete(matchID.id);
            //Rechargement de la page
            window.location.href = "arbitrage.html"
        } catch (error) {
            //Affichage de l'erreur dans la console
            console.error('Erreur de suppression du match :', error);
        }
    });
}

//Affichage des matchs sur la page d'accueil
//Elle s'appele index.html ou bien n'as pas d'autre juste /
if (window.location.href.includes("index.html") || window.location.href === "https://interpromo.appen.fr/") {
    //Affichage des matchs
    matchList.forEach(match => {
        let container = document.getElementById('cardContainer');
        const cardHTML = `
            <div class="card my-3" id="card${match.id}">
                <div class="card-header text-center bg-light-subtle ${match.status === "waiting" ? "text-primary-emphasis" : match.status === "in_progress" ? "text-warning-emphasis" : match.status === "finished" ? "text-success-emphasis" : "text-emphasis-light"}" id="cardHeader${match.id}">
                    ${match.status === "in_progress" || match.status === "finished" ? '' : new Date(match.heure_debut).toLocaleString()}
                    ${match.status === "in_progress" || match.status === "finished" ? `
                        <div class="d-flex justify-content-evenly">
                            <p id="pointT1${match.id}">${match.point1}</p>
                            <p>-</p>
                            <p id="pointT2${match.id}">${match.point2}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="card-body bg-light-subtle text-emphasis-light">
                    ${match.team1 && match.team2 ? `<h5 class="card-title text-center">${match.expand.team1.name} VS ${match.expand.team2.name}</h5>` : ''}
                    <p class="card-text text-center text-capitalize mb-0">${match.expand.sport.name}</p>
                    ${match.name !== "" ? `<p class="card-text text-center fw-semibold text-body-secondary">${match.name}</p>` : ''}
                </div>
                <div class="card-footer bg-light-subtle ${match.status === "waiting" ? "text-primary-emphasis" : match.status === "in_progress" ? "text-warning-emphasis" : match.status === "finished" ? "text-success-emphasis" : "text-emphasis-light"}" id="cardFooter${match.id}">
                    ${match.status === "waiting" ? "Match en attente" : match.status === "in_progress" ? "Match en cours" : match.status === "finished" ? "Match terminé" : "Erreur de statut"}
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

//Fonctionne dans match.js mais pas dans player.js PARCE QUE: NIQUE
//Gestion de l'ajout d'un joueur
if (window.location.href.includes("arbitrage.html")) {
    const promotions = await pb.collection('promo').getFullList({});
    const promoSelect = document.getElementById('Playerpromo');

    // Remplir dynamiquement les options de promo
    const promoOptions = promotions.map(promo => `<option id="${promo.id}" value="${promo.id}">${promo.name}</option>`).join('');
    promoSelect.innerHTML = promoOptions;


    const playerAddForm = document.getElementById('addPlayerForm');
    playerAddForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        
        //Récupération des données du formulaire
        const nom = document.getElementById('PlayerlastName').value;
        const prenom = document.getElementById('PlayerfirstName').value;
        const promoId = document.getElementById('Playerpromo').selectedOptions[0].value;

        const data = {
            "name": nom,
            "prenom": prenom,
            "promo": promoId
        };
        await pb.collection('joueurs').create(data);
        //rechargement de la page
        window.location.href = "arbitrage.html";
    });
}

//Affichage de la liste des joueurs
if (window.location.href.includes("arbitrage.html")) {
    const allPlayerList = await pb.collection('joueurs').getFullList({
        expand: 'promo'
    });
    const playerListContainer = document.getElementById('playersList');
    //Affichage des joueurs dans la liste sous la forme nom prénom - promo
    allPlayerList.forEach(player => {
        const playerHTML = `
            <li class="list-group list-group-item d-flex justify-content-between align-items-center">
                ${player.name} ${player.prenom} - ${player.expand.promo.name}
            </li>
        `;
        playerListContainer.innerHTML += playerHTML;
    });
    //Fonction de recherche de joueur
    const searchPlayerInput = document.getElementById('searchPlayerInput');
    searchPlayerInput.addEventListener('input', async function () {
        const search = searchPlayerInput.value.toLowerCase();
        const filteredPlayerList = allPlayerList.filter(player => player.name.toLowerCase().includes(search) || player.prenom.toLowerCase().includes(search) || player.expand.promo.name.toLowerCase().includes(search));
        playerListContainer.innerHTML = "";
        filteredPlayerList.forEach(player => {
            const playerHTML = `
                <li class="list-group list-group-item d-flex justify-content-between align-items-center">
                    ${player.name} ${player.prenom} - ${player.expand.promo.name}
                </li>
            `;
            playerListContainer.innerHTML += playerHTML;
        });
    });
}

if (window.location.href.includes("arbitrage.html")) {
    const PromoList = await pb.collection('promo').getFullList({});
    const promoSelect = document.getElementById('Teampromo');
    promoSelect.innerHTML = PromoList.map(promo => `<option id="${promo.id}" value="${promo.id}">${promo.name}</option>`).join('');
    const PlayerList = await pb.collection('joueurs').getFullList({
        expand: 'promo'
    });
    const playerSelect = document.getElementById('TeamPlayers');
    // display the list of players with her name, firstname and promo
    playerSelect.innerHTML = PlayerList.map(player => `<option id="${player.id}" value="${player.id}">${player.name} ${player.prenom} ${player.expand.promo.name}</option>`).join('');
    const captaineSelect = document.getElementById('Teamcaptain');
    captaineSelect.innerHTML = PlayerList.map(player => `<option id="${player.id}" value="${player.id}">${player.name} ${player.prenom} ${player.expand.promo.name}</option>`).join('');
    const SportList = await pb.collection('sport').getFullList({});
    const sportSelect = document.getElementById('Teamsport');
    sportSelect.innerHTML = SportList.map(sport => `<option id="${sport.id}" value="${sport.id}">${sport.name} (${sport.tableau})</option>`).join('');
    const teamAddForm = document.getElementById('addTeamForm');
    teamAddForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const teamName = document.getElementById('TeamName').value;
        const teamPromo = document.getElementById('Teampromo').selectedOptions[0].value;
        const teamSport = document.getElementById('Teamsport').selectedOptions[0].value;
        const teamPlayers = Array.from(document.getElementById('TeamPlayers').selectedOptions).map(option => option.value);
        const teamCaptain = document.getElementById('Teamcaptain').selectedOptions[0].value;
        const data = {
            "name": teamName,
            "promo": teamPromo,
            "sport": teamSport,
            "membres": teamPlayers,
            "capitaine": teamCaptain
        };
        await pb.collection('equipes').create(data);
        window.location.href = "arbitrage.html";
    });
}

//Gestion de la suppression d'une équipe
if (window.location.href.includes("arbitrage.html")) {
    const allTeamList = await pb.collection('equipes').getFullList({
        expand: 'promo,sport'
    });
    const teamDelListContainer = document.getElementById('TeamDelName');
    allTeamList.forEach(team => {
        const teamHTML = `
            <option value="${team.id}">${team.name} - ${team.expand.promo.name} - ${team.expand.sport.name}</option>
        `;
        teamDelListContainer.innerHTML += teamHTML;
    });
    const teamDelForm = document.getElementById('delTeamForm');
    teamDelForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const teamID = document.getElementById('TeamDelName').selectedOptions[0].value;
        await pb.collection('equipes').delete(teamID);
        window.location.href = "arbitrage.html";
    });
}

console.log("Backend match loaded!");