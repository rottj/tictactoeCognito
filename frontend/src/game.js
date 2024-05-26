//var hostAddress = 'http://localhost:5000';
//var hostAddress = 'http://localhost:8080';
//var hostAddress = 'http://rottj.us-east-1.elasticbeanstalk.com:8080';

var url = window.location.href;
var urlParts = url.split(':');
var hostAddress = urlParts[0] + ':' + urlParts[1] + ':8080';

var parametr = window.location.search.substring(1);
var yourNick = parametr.split('=')[1];
document.getElementById('yourNick').innerHTML = 'Your nick: ' + yourNick;

function getOpponent() {
    var xhr = new XMLHttpRequest();
    //xhr.open('GET', 'http://localhost:5000/get_players', true);
    xhr.open('GET', hostAddress + '/get_players', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var accessToken = localStorage.getItem('accessToken');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                var players = data.players;
                if (players.player1 == yourNick || players.player2 == yourNick) {
                    if(players.player1 === null || players.player2 === null){
                        document.getElementById('opponent').innerHTML = 'Waiting for second player...';
                    }
                    else if (players.player1 === yourNick){
                        document.getElementById('opponent').innerHTML = 'Opponents nick: ' + players.player2;
                        document.getElementById('yourSymbol').innerHTML = 'Your symbol: X ';                               
                    }
                    else if (players.player2 === yourNick){
                        document.getElementById('opponent').innerHTML = 'Opponents nick: ' + players.player1;
                        document.getElementById('yourSymbol').innerHTML = 'Your symbol: O ';    
                    }
                } else {
                console.error('Error getting players');
                }
            }                    
        }
    };

    xhr.send();
}

function makeMove(move) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', hostAddress +'/send_move', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var accessToken = localStorage.getItem('accessToken');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                updateBoard();
            } else {
                console.error('Error making move');
            }
        }
    };
    xhr.send(JSON.stringify({move: move, yourNick: yourNick}));       
}

function updateBoard() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', hostAddress +'/get_board', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var accessToken = localStorage.getItem('accessToken');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                var board = data.board;
                renderBoard(board);
            } else {
                console.error('Error getting board');
            }
        }
    };

    xhr.send();
}

function renderBoard(board) {
    var cells = document.getElementsByClassName('box');
    for (var i = 0; i < cells.length; i++) {
        if (board[i] === 'n') {
            cells[i].textContent = '';
            cells[i].setAttribute('onclick', 'makeMove(' + i + ')');
        } else if (board[i] === 'x') {
            cells[i].textContent = 'X';
        } else if (board[i] === 'o') {
            cells[i].textContent = 'O';
        }
    }
}

function checkWin() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', hostAddress +'/get_winner', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var accessToken = localStorage.getItem('accessToken');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                var winner = data.winner;
                if(winner == yourNick){
                    document.getElementById('winner').innerHTML = 'You won!';
                }
                else if(winner == 'pat'){
                    document.getElementById('winner').innerHTML = 'Pat!';
                }
                else if(winner != 'None'){
                    document.getElementById('winner').innerHTML = 'You lost!';
                }
            } else {
                console.error('Error getting winner');
            }
        }
    };

    xhr.send();
}

function endGame(){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', hostAddress + '/end_game', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var accessToken = localStorage.getItem('accessToken');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                checkEndGame();
            } else {
                console.error('Error ending game');
            }
        }
    };
    xhr.send();       
}

function checkEndGame(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', hostAddress +'/get_end', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var accessToken = localStorage.getItem('accessToken');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                var gameRunning = data.gameRunning;
                if (gameRunning == false) {
                    window.location = "index.html";
                }

            }                    
        }
    };

    xhr.send();
}

setInterval(checkWin, 1000);
setInterval(getOpponent, 1000);
setInterval(updateBoard, 1000);
setInterval(checkEndGame, 1000);

