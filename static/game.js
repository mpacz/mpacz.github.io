var socket = io();
var movement = {
    up: false,
    down: false,
    left: false,
    right: false
} 

var directionVector = new Victor(0 ,0);

var playersGlobal;
var socketId;

document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 65: // A
        movement.left = true;
        break;
        case 87: // W
        movement.up = true;
        break;
        case 68: // D
        movement.right = true;
        break;
        case 83: // S
        movement.down = true;
        break;
    }
});

setName()

document.addEventListener('mousemove', onMouseUpdate, false);

function onMouseUpdate(event){
    var canvas = document.getElementById('canvas');
    var canvasCords = getOffset(canvas);
    var x = event.clientX - canvasCords.left - playersGlobal[socket.id].x - 15;
    var y = event.clientY - canvasCords.top - playersGlobal[socket.id].y - 15;
    directionVector = new Victor(x, y).normalize();
    console.log(directionVector);
}

document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 65: // A
        movement.left = false;
        break;
        case 87: // W
        movement.up = false;
        break;
        case 68: // D
        movement.right = false;
        break;
        case 83: // S
        movement.down = false;
        break;
    }
});

document.addEventListener('click', function(event) {
    socket.emit('click', directionVector);
});


setInterval(function() {
    socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById('canvas');
canvas.width = 1100;
canvas.height = 800;
var playerObject = canvas.getContext('2d');
var playerHp = canvas.getContext('2d');
var missileObject = canvas.getContext('2d');

socket.on('state', function(players, missiles) {
    playersGlobal = players;
    playerObject.clearRect(0, 0, 1100, 800);
    generateScores(players);
    for (var id in players) {
        var player = players[id];
        playerObject.beginPath();

        if(id == socket.id){
            playerObject.fillStyle = 'blue';
        }
        else{
            playerObject.fillStyle = 'red';
        }

        playerObject.arc(player.x, player.y, 25, 0, 2 * Math.PI);
        playerObject.fill();

        if(player.hp < 40){
            playerHp.fillStyle = 'red';
        }
        else{
            playerHp.fillStyle = 'green';
        }

        playerHp.beginPath();
        var playerHpPx = player.hp / 2;
        var hpDisplacement = 100 - player.hp;
        playerHp.rect(player.x - 25 + hpDisplacement/4, player.y - 35, playerHpPx, 2);
        playerHp.fill();
    }

    missileObject.fillStyle = 'red';
    missileObject.beginPath();

    for (var id in missiles) {
        var missile = missiles[id];
        missileObject.arc(missile.x, missile.y, 4, 0, 2 * Math.PI);
        missileObject.fill();
    }
});

function generateScores(players){
    removeElementsByClass('subscore');

    for (var id in players){
        var player = players[id];
        var scoreDiv = document.getElementById('scoreTable');
        var div = document.createElement("div");
        div.innerHTML = player.score + ' - ' + player.name;
        div.className = 'subscore';
        scoreDiv.appendChild(div);
    }
}

function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
}

function setName() {
    var person = prompt("Please enter your name:", "");
    socket.emit('new player', person);
}

function removeElementsByClass(className){
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}