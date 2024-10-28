console.log("Backend match start loading...");
import pb from './login.js'

(async () => {
    const matchList = await pb.collection('match').getFullList({
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
            });
        }
    });

    function createMatchCard(record) {
        const time_start = new Date(record.heure_debut).toLocaleString();
        const team1Name = record.expand.team1 ? record.expand.team1.name : '';
        const team2Name = record.expand.team2 ? record.expand.team2.name : '';
        const sportName = record.expand.sport.name;
        const matchName = record.name;
        const statusClass = record.status === "waiting" ? "btn-primary" :
                            record.status === "in_progress" ? "btn-warning" :
                            record.status === "finished" ? "btn-success" : "btn-secondary";
        const statusText = record.status === "waiting" ? "Démarrer et arbitrer ce match" :
                           record.status === "in_progress" ? "Arbitrer ce match" :
                           record.status === "finished" ? "Match terminé" : "Erreur de statut";

        return `
            <div class="card my-3">
                <div class="card-header text-center bg-light-subtle text-emphasis-light">${time_start}</div>
                <div class="card-body bg-light-subtle text-emphasis-light">
                    <h5 class="card-title text-center">${team1Name} VS ${team2Name}</h5>
                    <p class="card-text text-center text-capitalize mb-0">${sportName}</p>
                    <p class="card-text text-center fw-semibold text-body-secondary">${matchName}</p>
                    <div class="text-center">
                        <a class="btn mt-2 ${statusClass}" href="arbimatch.html?id=${record.id}">${statusText}</a>
                    </div>
                </div>
            </div>
        `;
    }

    //Affichage des matchs sur la page d'arbitrage
    if (window.location.href.includes("arbitrage.html")) {
        const container = document.getElementById('cardContainer');
        if (container) {
            matchList.forEach(record => {
                const cardHTML = createMatchCard(record);
                container.insertAdjacentHTML('beforeend', cardHTML);
            });
        }
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
                                    ${sportList.map(sport => `<option>${sport.name}</option>`).join('')}
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
        const modalAddMatch = document.getElementById('modalAddMatch');
        if (modalAddMatch) {
            modalAddMatch.innerHTML = modalHTML;
        }
    }

    //Gestion de l'ajout d'un match
    if (window.location.href.includes("arbitrage.html")) {
        const addMatchForm = document.getElementById('addMatchForm');
        if (addMatchForm) {
            addMatchForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                // Ajoutez ici la logique pour ajouter un match
            });
        }
    }

    //Gestion de la modal de supression d'un match
    if (window.location.href.includes("arbitrage.html")) {
        const delMatchHTML = `
            <label for="matchdel" class="form-label">Match à supprimer</label>
            <select class="form-control" id="matchdel">
                ${matchList.map(record => `<option value="${record.id}">${record.name}</option>`).join('')}
            </select>
        `;
        const matchdelJS = document.getElementById('matchdelJS');
        if (matchdelJS) {
            matchdelJS.innerHTML = delMatchHTML;
        }
    }

    //Gestion de la supression d'un match
    if (window.location.href.includes("arbitrage.html")) {
        const delMatchForm = document.getElementById('delMatchForm');
        if (delMatchForm) {
            delMatchForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                // Ajoutez ici la logique pour supprimer un match
            });
        }
    }

    //Affichage des matchs sur la page d'accueil
    if (window.location.href.includes("index.html") || window.location.href === "https://interpromo.appen.fr/") {
        const container = document.getElementById('matchContainer');
        if (container) {
            matchList.forEach(match => {
                const cardHTML = createMatchCard(match);
                container.insertAdjacentHTML('beforeend', cardHTML);
            });
        }
    }

    console.log("Backend match loaded!");
})();