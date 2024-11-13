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

const equipeList = await pb.collection('equipes').getFullList({
    sort: '+classement',
    expand: 'sport'
});

const sportList = await pb.collection('sport').getFullList({
    expand: "following"
});

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

function getTableCard(sport){
    console.log(sport)
    let card = `
    <div class="card my-3">
        <div class="card-body bg-light-subtle text-emphasis-light border border-3 border-${sport.state === "waiting" ? "info" : "warning"}">
            <h3 class="card-title text-center">${sport.name}</h5>
            <p class="card-text text-center text-capitalize mb-0">${sport.tableau} ${sport.following != "" ? "(qualificatif à " + sport.expand.following.tableau + ")" : "(finale)"}</p>
            <div class="text-center">
                <button class="btn ${sport.state === "waiting" ? "btn-primary" : "btn-warning"} mt-2" id="${sport.id}" ${sport.state === "started" && sport.following != "" ? 'data-bs-toggle="modal" data-bs-target="#modalTournoi' + sport.id + '"' : ""}>
                    ${sport.state === "waiting" ? "Démarrer ce tournoi" : "Mettre fin à ce tournoi"}
                </button>
            </div>
        </div>
    </div>`
    if(sport.state === "started" && sport.following != ""){
        card = card + `
        <div class="modal" tabindex="-1" id="modalTournoi${sport.id}">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Mettre fin à ${sport.name} - ${sport.tableau} (qualificatif à ${sport.expand.following.tableau})</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <form id="endTournoi${sport.id}">
                            <div class="form-group">
                                <h4>Les équipes suivantes seront qualifiées en finales :</h4>
                                ${equipeList.filter(team => team.expand.sport.id === sport.id).reduce((prev, cur, i) => i < sport.qualified ? prev + '<p>' + cur.name + '</p>' : prev, '')}
                            </div>
                            <br>
                            <button type="submit" class="btn btn-danger">Mettre fin à ce tournoi ? Attention cette action est irréversible
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        <div>`
    }
    return card;
}

//Affichage des matchs sur la page d'arbitrage
if (window.location.href.includes("arbitrage.html")) {
    let alreadyPrintedSports = [];
    let finishedMatch = [];
    let container = document.getElementById('cardContainer');
    //Affichage des matchs
    sportList.filter(sport => sport.state === "started").forEach(sport => { // On met les tableaux en cours tout en haut
        const cardTableauHTML = getTableCard(sport);
        container.insertAdjacentHTML('beforeend', cardTableauHTML);
        alreadyPrintedSports.push(sport.id);
    })
    matchList.forEach(record => {
        if(!alreadyPrintedSports.includes(record.expand.sport.id) && !(record.expand.sport.state === "finished")){
            //Si tableau pas encore affiché : on le met avant le premier match du tableau
            const cardTableauHTML = getTableCard(record.expand.sport);
            container.insertAdjacentHTML('beforeend', cardTableauHTML);
            alreadyPrintedSports.push(record.expand.sport.id);
        }
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
                        <a class="btn ${record.status === "waiting" ? "btn-primary" : record.status === "in_progress" ? "btn-warning" : record.status === "finished" ? "btn-success" : "btn-secondary"} mt-2" id="${record.id}">
                            ${record.status === "waiting" ? "Démarrer et arbitrer ce match" : record.status === "in_progress" ? "Arbitrer ce match" : record.status === "finished" ? "Match terminé" : "Erreur de statut"}
                        </a>
                    </div>
                </div>
            </div>
        `;
        if(record.status == "finished"){
            finishedMatch.push({id: record.id, html: cardHTML});
        } else {
            container.insertAdjacentHTML('beforeend', cardHTML);
            const button = document.getElementById(record.id);
            button.addEventListener('click', () => {
                window.location.href = `arbimatch.html?id=${record.id}`;
            });
        }
    });
        finishedMatch.forEach(record => {
        container.insertAdjacentHTML('beforeend', record.html);
        const button = document.getElementById(record.id);
        button.addEventListener('click', () => {
            window.location.href = `arbimatch.html?id=${record.id}`;
        });
    })
}

sportList.forEach(sport => {
    //Gestion des appui sur bouton pour les tournois
    if(sport.state === "started" && sport.following != ""){
        console.log("Adding event on " + "#endTournoi"+sport.id);
        document.querySelector("#endTournoi"+sport.id).addEventListener("submit", async e => {
            e.preventDefault();
            const sportData = {"state": "finished"};
            try {
                console.log("trying to finish sport with following tournament");
                await pb.collection('sport').update(sport.id, sportData);
            } catch (error) {
                console.error('Erreur de fin du tournoi :', error);
            }
            let i = 0;
            equipeList.filter(team => team.expand.sport.id === sport.id).slice(0,sport.qualified).forEach(async qualifiedTeam => {
                const teamData = {"sport": sport.expand.following.id};
                try {
                    await pb.collection('equipes').update(qualifiedTeam.id, teamData);
                    i++;
                    if(i === sport.qualified){
                        window.location.href = "arbitrage.html"; //reload only after all request are terminated
                    }
                } catch (error) {
                    console.error('Erreur de fin du tournoi :', error);
                }
            })
        })
    } else if(sport.state === "started"){
        document.querySelector("#"+sport.id).addEventListener("click", async e => {
            const data = {"state": "finished"};
            try {
                console.log("trying to finish sport as final phase");
                await pb.collection('sport').update(sport.id, data);
                window.location.href = "arbitrage.html";
            } catch (error) {
                console.error('Erreur de fin du tournoi :', error);
            }
        })
    } else if(sport.state === "waiting"){
        try {
            document.querySelector("#"+sport.id).addEventListener("click", async e => {
                const data = {"state": "started"};
                try {
                    console.log("trying to start sport");
                    await pb.collection('sport').update(sport.id, data);
                    window.location.href = "arbitrage.html";
                } catch (error) {
                    console.error('Erreur de fin du tournoi :', error);
                }
            })
        } // Si erreur ici : pas grave c'est qu'il n'y a aucun match de créé pour un tournoi en waiting donc la card de tournoi n'est pas créée
        catch (e){
            console.log("Erreur card de tournoi, aucun match dans ce tournoi : " + e);
        }
    }
});

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
                                ${equipeList.map(equipe => `<option>${equipe.name} - ${equipe.expand.sport.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="equipe2" class="form-label">Equipe 2</label>
                            <select class="form-control" id="equipe2">
                                ${equipeList.map(equipe => `<option>${equipe.name} - ${equipe.expand.sport.name}</option>`).join('')}
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
        // Récupération de l'id du sport
        let sportID = document.getElementById("sport").value;
        sportID = sportList.find(sport => `${sport.name} (${sport.tableau})` === sportID);
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
    let finishedMatch = [];
    let container = document.getElementById('cardContainer');
    matchList.forEach(match => {
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
        if(match.status == "finished"){
            finishedMatch.push(cardHTML);
        } else {
            container.insertAdjacentHTML('beforeend', cardHTML);
        }
    });
    finishedMatch.forEach(card => {
        container.insertAdjacentHTML('beforeend', card);
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
        const allPlayerList = await pb.collection('joueurs').getFullList({
            expand: 'promo'
        });
        const existingPlayer = allPlayerList.find(player =>
            player.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") &&
            player.prenom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === prenom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") &&
            player.promo === promoId
        );

        if (existingPlayer) {
            alert("Un joueur avec ce nom, prénom et promo existe déjà.");
        } else {
            await pb.collection('joueurs').create(data);
            window.location.href = "arbitrage.html";
        }
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

// Gestion de l'ajout d'une équipe
if (window.location.href.includes("arbitrage.html")) {
    const PromoList = await pb.collection('promo').getFullList({});
    const promoSelect = document.getElementById('Teampromo');
    promoSelect.innerHTML = PromoList.map(promo => `<option id="${promo.id}" value="${promo.id}">${promo.name}</option>`).join('');
    const PlayerList = await pb.collection('joueurs').getFullList({
        expand: 'promo',
        sort: '+name'
    });
    const playerSelect = document.getElementById('TeamPlayers');
    const captaineSelect = document.getElementById('Teamcaptain');
    const sportSelect = document.getElementById('Teamsport');
    const SportList = await pb.collection('sport').getFullList({});
    sportSelect.innerHTML = SportList.map(sport => `<option id="${sport.id}" value="${sport.id}">${sport.name} (${sport.tableau})</option>`).join('');

    // Fonction pour mettre à jour la liste des options de capitaine en fonction des joueurs sélectionnés
    function updateCaptainOptions() {
        const selectedPlayerIds = Array.from(document.querySelectorAll('#TeamPlayers input:checked')).map(checkbox => checkbox.value);
        const selectedPlayers = PlayerList.filter(player => selectedPlayerIds.includes(player.id));
        captaineSelect.innerHTML = selectedPlayers.map(player => `<option id="${player.id}" value="${player.id}">${player.name} ${player.prenom} ${player.expand.promo.name}</option>`).join('');
    }

    // Fonction pour mettre à jour la liste des joueurs en fonction de la promo sélectionnée
    function updatePlayerList(promoId) {
        const filteredPlayers = PlayerList.filter(player => player.promo === promoId);
        playerSelect.innerHTML = filteredPlayers.map(player => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${player.id}" id="${player.id}">
                <label class="form-check-label" for="${player.id}">
                    ${player.name} ${player.prenom} ${player.expand.promo.name}
                </label>
            </div>`).join('');
        // Add event listeners to checkboxes
        document.querySelectorAll('#TeamPlayers input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateCaptainOptions);
        });
        updateCaptainOptions();
    }

    // Fonction pour filtrer les joueurs en fonction de la recherche et de la promo sélectionnée
    // Fonction pour filtrer les joueurs en fonction de la recherche et de la promo sélectionnée
    function filterPlayers() {
        const searchValue = document.getElementById('searchPlayer').value.toLowerCase();
        const selectedPromoId = promoSelect.value;
        const selectedPlayerIds = Array.from(document.querySelectorAll('#TeamPlayers input:checked')).map(checkbox => checkbox.value);

        const filteredPlayers = PlayerList.filter(player =>
            player.promo === selectedPromoId &&
            (player.name.toLowerCase().includes(searchValue) ||
                player.prenom.toLowerCase().includes(searchValue))
        );

        playerSelect.innerHTML = filteredPlayers.map(player => `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${player.id}" id="${player.id}" ${selectedPlayerIds.includes(player.id) ? 'checked' : ''}>
            <label class="form-check-label" for="${player.id}">
                ${player.name} ${player.prenom} ${player.expand.promo.name}
            </label>
        </div>`).join('');

        // Add event listeners to checkboxes
        document.querySelectorAll('#TeamPlayers input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateCaptainOptions);
        });
        updateCaptainOptions();
    }

    // Ajout de l'événement change sur le champ de sélection de la promo
    promoSelect.addEventListener('change', function () {
        const selectedPromoId = promoSelect.value;
        updatePlayerList(selectedPromoId);
    });

    // Ajout de l'événement input sur le champ de recherche
    document.getElementById('searchPlayer').addEventListener('input', filterPlayers);

    const teamAddForm = document.getElementById('addTeamForm');
    teamAddForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const teamName = document.getElementById('TeamName').value;
        const teamPromo = document.getElementById('Teampromo').selectedOptions[0].value;
        const teamSport = document.getElementById('Teamsport').selectedOptions[0].value;
        const teamPlayers = Array.from(document.querySelectorAll('#TeamPlayers input:checked')).map(checkbox => checkbox.value);
        const teamCaptain = document.getElementById('Teamcaptain').selectedOptions[0].value;
        const data = {
            "name": teamName,
            "promo": teamPromo,
            "sport": teamSport,
            "membres": teamPlayers,
            "capitaine": teamCaptain
        };
        console.log(data);
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