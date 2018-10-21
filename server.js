
var Victor = require('victor');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use('/static', express.static(__dirname + '/static'))
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

io.on('connection', function(socket) {
});


var players = {};
var missiles = {};

io.on('connection', function(socket) {
  socket.on('new player', function(userName) {
    players[socket.id] = {
      x: Math.random() * 400 + 300,
      y: Math.random() * 400 + 200,
      hp: 100,
      score: 0,
      name: userName
    };
  });

  socket.on('click', function(data){
      var player = players[socket.id];
      if(typeof player != 'undefined'){
        missiles[socket.id] = {
          x: player.x,
          y: player.y,
          vec: data
        }
      }
  })

  socket.on('disconnect', function() {
      if(players[socket.id] != null){
          delete players[socket.id];
          delete missiles[socket.id];
      }
  });
  
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left && player.x >0) {

      player.x -= 5;
    }
    if (data.up && player.y >0) {
      player.y -= 5;
    }
    if (data.right && player.x <1100) {
      player.x += 5;
    }
    if (data.down && player.y <800) {
      player.y += 5;
    }
  });
});

setInterval(function() {
  calcMissiles();
  calcCollisions(); 
  io.sockets.emit('state', players, missiles);
}, 1000 / 60);

function calcMissiles(){
  for (var id in missiles){
    if(missile.x > 2000 || missile.x < 2000 || missile.y < 2000 || missile.y > 2000){
      delete missiles[id];
    }
    var missile = missiles[id];
    missile.x = missile.x + missile.vec.x * 25;
    missile.y = missile.y + missile.vec.y * 25;
  }
}

function calcCollisions(){
  for (var id in missiles){
    var missile = missiles[id];
    for (var playerId in players){
      var player = players[playerId];
      if(getDistance(player, missile)<25 && id != playerId){
        players[playerId].hp = player.hp - 25;

        if(players[playerId].hp <1){
          delete players[playerId];
          delete missiles[playerId];
          players[id].score++;
        }

        delete missiles[id];
      }
    }
  }
}

function getDistance(player, missile){
  return distance = Math.sqrt(Math.pow(player.x - missile.x, 2) + Math.pow(player.y - missile.y, 2));
}