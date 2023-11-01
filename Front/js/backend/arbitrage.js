console.log("Backend arbitrage start loading...");
import pb from './login.js'

const idMatch = window.location.href.split("=")[1];
const data = {
    "status": "in_progress",
};

const record = await pb.collection('match').update(idMatch, data);

const currentStatus = await pb.collection('match').getOne(idMatch, {
    expand: 'sport',
});

const textPoint1 = document.getElementById("textPoint1")
const textPoint2 = document.getElementById("textPoint2")

textPoint1.innerHTML = currentStatus.point1;
textPoint2.innerHTML = currentStatus.point2;

const buttonPoint1 = document.getElementById("btnPoint1")
const buttonPoint2 = document.getElementById("btnPoint2")


console.log(currentStatus);

if(currentStatus.expand.sport.name === "basketball"){
    buttonPoint1.addEventListener('click', async function(event) {
        event.preventDefault();
        const data = {
            "point1": currentStatus.point1 + 3,
        };
        const record = await pb.collection('match').update(idMatch, data);
        textPoint1.innerHTML = currentStatus.point1 + 3;
        location.reload();
    });

    buttonPoint2.addEventListener('click', async function(event) {
        event.preventDefault();
        const data = {
            "point2": currentStatus.point2 + 3,
        };
        const record = await pb.collection('match').update(idMatch, data);
        textPoint2.innerHTML = currentStatus.point2 + 3;
        location.reload();
    });
}
else{
    buttonPoint1.addEventListener('click', async function(event) {
        event.preventDefault();
        const data = {
            "point1": currentStatus.point1 + 1,
        };
        const record = await pb.collection('match').update(idMatch, data);
        textPoint1.innerHTML = currentStatus.point1 + 1;
        location.reload();
    });

    buttonPoint2.addEventListener('click', async function(event) {
        event.preventDefault();
        const data = {
            "point2": currentStatus.point2 + 1,
        };
        const record = await pb.collection('match').update(idMatch, data);
        textPoint2.innerHTML = currentStatus.point2 + 1;
        location.reload();
    });
}

document.getElementById("btnStop").addEventListener('click', async function(event) {
    event.preventDefault();
    const data = {
        "status": "finished",
    };
    const record = await pb.collection('match').update(idMatch, data);
    window.location.href = "arbitrage.html";
});

console.log("Backend arbitrage loaded!");