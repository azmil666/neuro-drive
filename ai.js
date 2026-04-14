const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const statsDiv = document.getElementById("stats");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
let bestCar = car;
let bestScoreEver = localStorage.getItem("bestScore")
    ? parseInt(localStorage.getItem("bestScore"))
    : 0;
const difficulty = Math.min(1 + bestScoreEver / 2000, 2);

const MAX_TRAFFIC = Math.floor(6 * difficulty);
const TRAFFIC_SPACING = 220 / difficulty;    

if (localStorage.getItem("bestBrain")) {
    car.brain = JSON.parse(localStorage.getItem("bestBrain"));
}

let traffic = [];

function generateTraffic() {
    const lane = Math.floor(Math.random() * 3);

    const y = bestCar.y - TRAFFIC_SPACING;

    const laneCenter = road.getLaneCenter(lane);

    traffic.push(
        new Car(
            laneCenter,
            y,
            30,
            50,
            "DUMMY",
            2,
            getRandomColor()
        )
    );
}
for (let i = 1; i <= MAX_TRAFFIC; i++) {
    const lane = Math.floor(Math.random() * 3);
    traffic.push(
        new Car(
            road.getLaneCenter(lane),
            bestCar.y - i * TRAFFIC_SPACING,
            30,
            50,
            "DUMMY",
            2,
            getRandomColor()
        )
    );
}

animate();

function animate(time) {
    if (bestCar.score > bestScoreEver) {
    bestScoreEver = Math.floor(bestCar.score);
    localStorage.setItem("bestScore", bestScoreEver);
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}
    if (traffic.length < MAX_TRAFFIC) {
    generateTraffic();
}

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    car.update(road.borders, traffic);
    bestCar = car;
    
    if (bestCar.damaged) {
        localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
        if (bestCar.damaged) {

    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));

    car.x = road.getLaneCenter(1);
    car.y = 100;
    car.speed = 0;
    car.angle = 0;
    car.damaged = false;
    car.score = 0;
    car.passed = 0;

    traffic = [];

    for (let i = 1; i <= MAX_TRAFFIC; i++) {
        const lane = Math.floor(Math.random() * 3);
        traffic.push(
            new Car(
                road.getLaneCenter(lane),
                car.y - i * TRAFFIC_SPACING,
                30,
                50,
                "DUMMY",
                2,
                getRandomColor()
            )
        );
    }
}
    }

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx);
    }

    bestCar.draw(carCtx, true);

    carCtx.restore();

    statsDiv.innerHTML = `
 Autonomous Mode<br>
Score: ${Math.floor(bestCar.score)}<br>
 Best: ${bestScoreEver}<br>
 Passed: ${bestCar.passed}<br>
Speed: ${bestCar.speed.toFixed(2)}<br>
`;

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);

    requestAnimationFrame(animate);
}