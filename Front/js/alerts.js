function getSportIconHTML(sportName){
    switch(sportName.toLowerCase()){
        case "football":
            return `<span class="material-symbols-outlined">
                sports_soccer
            </span>`
        case "handball":
            return `<span class="material-symbols-outlined">
                sports_handball
            </span>`
        case "volleyball":
            return `<span class="material-symbols-outlined">
                sports_volleyball
            </span>`
        case "basketball":
            return `<span class="material-symbols-outlined">
                sports_basketball
            </span>`
        case "badminton":
            return ``
    }
}

function deleteAlert(alertId){
    const alert = bootstrap.Alert.getOrCreateInstance(`body #alertsContainer #${alertId}`)
    alert.close()
}

function newGoalAlert(match, goalTeam){
    let alertsContainer = document.querySelector('body #alertsContainer');
    let alert = `
    <div id="${match.id}${match.point1}_${match.point2}" class="alert alert-success alert-dismissible fade show" role="alert">
        <div class="d-flex align-items-center justify-content-between">
          <h4 class="alert-heading d-inline-flex align-items-center"><span class="material-symbols-outlined">
            scoreboard
          </span>BUT !</h4>
          <h4>${match.point1} - ${match.point2}</h4>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <p>${goalTeam === "team1" ? match.expand.team1.name : match.expand.team2.name} vient de marquer un but en ${match.expand.sport.name} face à ${goalTeam === "team1" ? match.expand.team2.name : match.expand.team1.name} !</p>
        <hr>
        <div class="d-flex align-items-center justify-content-between">
          <p class="mb-0 d-inline-flex align-items-center">${getSportIconHTML(match.expand.sport.name)}${match.expand.sport.name}</p>
          <p class="mb-0">${match.expand.team1.name}</p>
          <b><p class="mb-0">${match.point1} - ${match.point2}</p></b>
          <p class="mb-0">${match.expand.team2.name}</p>
        </div>
    </div>
    `
    alertsContainer.insertAdjacentHTML("beforeend", alert)
    //Send a notification to the client if the browser supports it
    if (Notification.permission === "granted") {
        let notification = new Notification(`${match.expand.team1.name} - ${match.expand.team2.name}`, {
            body: `${match.point1} - ${match.point2}`,
        });
    }
    setTimeout(deleteAlert, 5000, `${match.id}${match.point1}_${match.point2}`)
}

function matchEndAlert(match){
    let alertsContainer = document.querySelector('body #alertsContainer');
    let alert = `
    <div id="${match.id}${match.point1}_${match.point2}" class="alert alert-warning alert-dismissible fade show" role="alert">
        <div class="d-flex align-items-center justify-content-between">
          <h4 class="alert-heading d-inline-flex align-items-center"><span class="material-symbols-outlined">
            scoreboard
          </span>FIN DU MATCH !</h4>
          <h4>${match.point1} - ${match.point2}</h4>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <p>Le match entre ${match.expand.team1.name} et ${match.expand.team2.name} en ${match.expand.sport.name} est terminé !</p>
        <hr>
        <div class="d-flex align-items-center justify-content-between">
          <p class="mb-0 d-inline-flex align-items-center">${getSportIconHTML(match.expand.sport.name)}${match.expand.sport.name}</p>
          <p class="mb-0">${match.expand.team1.name}</p>
          <b><p class="mb-0">${match.point1} - ${match.point2}</p></b>
          <p class="mb-0">${match.expand.team2.name}</p>
        </div>
    </div>
    `
    alertsContainer.insertAdjacentHTML("beforeend", alert);
    //Send a notification to the client if the browser supports it
    if (Notification.permission === "granted") {
        let notification = new Notification(`${match.expand.team1.name} - ${match.expand.team2.name}`, {
            body: `${match.point1} - ${match.point2}`,
        });
    }
    setTimeout(deleteAlert, 5000, `${match.id}${match.point1}_${match.point2}`)
}

function startMatchAlert(match){
    let alertsContainer = document.querySelector('body #alertsContainer');
    let alert = `
    <div id="${match.id}${match.point1}_${match.point2}" class="alert alert-info alert-dismissible fade show" role="alert">
        <div class="d-flex align-items-center justify-content-between">
          <h4 class="alert-heading d-inline-flex align-items-center"><span class="material-symbols-outlined">
            scoreboard
          </span>DEBUT DU MATCH !</h4>
          <h4>${match.point1} - ${match.point2}</h4>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <p>Le match entre ${match.expand.team1.name} et ${match.expand.team2.name} en ${match.expand.sport.name} vient de commencer !</p>
        <hr>
        <div class="d-flex align-items-center justify-content-between">
          <p class="mb-0 d-inline-flex align-items-center">${getSportIconHTML(match.expand.sport.name)}${match.expand.sport.name}</p>
          <p class="mb-0">${match.expand.team1.name}</p>
          <b><p class="mb-0">${match.point1} - ${match.point2}</p></b>
          <p class="mb-0">${match.expand.team2.name}</p>
        </div>
    </div>
    `
    alertsContainer.insertAdjacentHTML("beforeend", alert);
    //Send a notification to the client if the browser supports it
    if (Notification.permission === "granted") {
        let notification = new Notification(`${match.expand.team1.name} - ${match.expand.team2.name}`, {
            body: `${match.point1} - ${match.point2}`,
        });
    }
    setTimeout(deleteAlert, 5000, `${match.id}${match.point1}_${match.point2}`)
}

function newSetAlert(match){
    let alertsContainer = document.querySelector('body #alertsContainer');
    let alert = `
    <div id="${match.id}${match.point1}_${match.point2}" class="alert alert-info alert-dismissible fade show" role="alert">
        <div class="d-flex align-items-center justify-content-between">
          <h4 class="alert-heading d-inline-flex align-items-center"><span class="material-symbols-outlined">
            scoreboard
          </span>NOUVEAU SET !</h4>
          <h4>${match.point1} - ${match.point2}</h4>
          <h5>${match.set1} - ${match.set2}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <p>Le set ${match.set} entre ${match.expand.team1.name} et ${match.expand.team2.name} en ${match.expand.sport.name} vient de commencer !</p>
        <hr>
        <div class="d-flex align-items-center justify-content-between">
          <p class="mb-0 d-inline-flex align-items-center">${getSportIconHTML(match.expand.sport.name)}${match.expand.sport.name}</p>
          <p class="mb-0">${match.expand.team1.name}</p>
          <b><p class="mb-0">${match.point1} - ${match.point2}</p></b>
          <p class="mb-0">${match.expand.team2.name}</p>
        </div>
    </div>
    `
    alertsContainer.insertAdjacentHTML("beforeend", alert);
    //Send a notification to the client if the browser supports it
    if (Notification.permission === "granted") {
        let notification = new Notification(`${match.expand.team1.name} - ${match.expand.team2.name}`, {
            body: `${match.point1} - ${match.point2}`,
        });
    }
    setTimeout(deleteAlert, 5000, `${match.id}${match.point1}_${match.point2}`)
}