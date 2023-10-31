const express = require('express')
const app = express()
const mysql = require('mysql');
const uuid = require('uuid');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 5000  

    //initialize a simple http server
const server = http.createServer(app);

var webSocketServer = new (require('ws')).Server({ noServer: true }),
    webSockets = {} // userID: webSocket
    
const waitingForAckMap = new Map();
const ackNotArrivedMap = new Map();

// CONNECT /:userID
// wscat -c ws://localhost:5000/1
webSocketServer.on('connection', function (webSocket, request) {
  var userID = request.url.substring(1);
  webSockets[userID] = webSocket;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(webSockets));

  // Forward Message
  //
  // Receive               Example
  // [toUserID, text]      [2, "Hello, World!"]
  //
  // Send                  Example
  // [fromUserID, text]    [1, "Hello, World!"]
  webSocket.on('message', function(message) {
    console.log('received from ' + userID + ': ' + JSON.stringify(message));
    //Ez olyan logika, hogy az üzenetből vesszük ki most a címzettet, a címzett ? előtt szerepel -> user?ez egy üzi neked
    var parsedMessageToJson = JSON.parse(message);
    if (parsedMessageToJson.webSocketMessageType == 'ACK') {
    	console.log("ACK come from: " + userID);
    	//Ez egy ack üzenet
    	clearTimeout(waitingForAckMap.get(parsedMessageToJson.ackToken));
    	clearTimeout(ackNotArrivedMap.get(parsedMessageToJson.ackToken));
    	// Remove an item from the map by key
	waitingForAckMap.delete(parsedMessageToJson.ackToken);
	ackNotArrivedMap.delete(parsedMessageToJson.ackToken);
    } else if(parsedMessageToJson.webSocketMessageType == 'FOUND_ENEMY') {
    	let toUser = parsedMessageToJson.toUserToken;
    	var toUserWebSocket = webSockets[toUser];
    	if (toUserWebSocket) {
    		toUserWebSocket.send(JSON.stringify(message));
    	}
    } else if(parsedMessageToJson.webSocketMessageType == 'SURRENDER') {
    	let toUser = parsedMessageToJson.toUserToken;
    	var toUserWebSocket = webSockets[toUser];
    	if (toUserWebSocket) {
    		toUserWebSocket.send(JSON.stringify(message));
    	}
    	//itt beállítani a győztest és a vesztest adatbázisban
    	dbConnection.query('UPDATE FindMatch fm SET winnerUserId = (SELECT us.id FROM UserEntity us WHERE us.token = ?), loserUserId = (SELECT us.id FROM UserEntity us where us.token = ?) where fm.loserUserId is null and fm.winnerUserId is null and (fm.token1 = ? or fm.token1 = ?)', 
	    	[parsedMessageToJson.toUserToken, parsedMessageToJson.loserToken, parsedMessageToJson.toUserToken, parsedMessageToJson.loserToken], function (err, result) {
		if (err) throw err;
	});
    } else if(parsedMessageToJson.webSocketMessageType == 'GAME_CHANGE_TURN') {
	let toUser = parsedMessageToJson.toUserToken;
	let fromUserWebSocket = webSockets[userID];
	let ackFromServerJson = {
		webSocketMessageType : 'ACK_FROM_SERVER',
		uuidOfAckMessage : parsedMessageToJson.uuid
	};
	
	fromUserWebSocket.send(JSON.stringify(Buffer.from(JSON.stringify(ackFromServerJson), "utf-8")));
	
	//var messageArray = JSON.parse(message)
	    var toUserWebSocket = webSockets[toUser];
	    console.log('id toUser: ' + toUser);
	    //console.log('websockets: ' + JSON.stringify(webSockets));
	    //console.log('towebsocket: ' + JSON.stringify(toUserWebSocket));
	    if (toUserWebSocket) {
	    	// Itt mindkét játékos ack timeoutjait töröljük, mert valakitől jött üzenet
	    	waitingForAckMap.delete(toUser);
		ackNotArrivedMap.delete(toUser);
		waitingForAckMap.delete(userID);
		ackNotArrivedMap.delete(userID);
	      	//console.log('sent to ' + messageArray[0] + ': ' + JSON.stringify(messageArray))
	      	//messageArray[0] = userID
	      	//toUserWebSocket.send(JSON.stringify(messageArray));
	      	console.log('send from: ' + userID + ' to ' + toUser + ' the message: ' + message)
	      	toUserWebSocket.send(JSON.stringify(message));
	      
	      	// Set a timeout to check if the message was acknowledged by the client
		const timeoutId = setTimeout(() => {
		    console.log('Send websocket message again to: ' + toUser);
		    toUserWebSocket.send(JSON.stringify(message));
		    const ackNotTimeoutId = setTimeout(() => {
		       console.log('End of the game, other playerwins');
		    }, 20000);
		    ackNotArrivedMap.set(toUser, ackNotTimeoutId);
		}, 20000);
		waitingForAckMap.set(toUser, timeoutId);
	    }	
    }
  })

  webSocket.on('close', function () {
    delete webSockets[userID]
    console.log('deleted: ' + userID)
  })
})

var dbConnection = mysql.createPool({
  host: "db4free.net",
  user: "piratearena1993",
  password: "Rohadjmeg1",
  database: "piratearena1993"
});

dbConnection.getConnection(function(err, connection) {
  // connected! (unless `err` is set)
  connection.release();
});

// az alsó két beállítás azért kell, hogy a rest request bodyjából ki tudjunk szedni adatokat
app.use(
  express.urlencoded({
    extended: true
  })
)
app.use(express.json())

app.use(express.static('public'));
  
app.post('/login', (req, res) => {
	dbConnection.query('SELECT * FROM UserEntity us WHERE us.username = ? AND us.password = ?', [req.body.username, req.body.password], function (err, result) {
		if (err) throw err;
		//console.log("Result: " + JSON.stringify(result));
		if(result.length === 0) {
			res.status(401);
			res.send("Auth error")
		} else {
			generatedToken = uuid.v4();
			dbConnection.query('UPDATE UserEntity SET token = ? WHERE username = ? AND password = ?', [generatedToken, req.body.username, req.body.password], function (err, result) {
				if (err) throw err;
				console.log(result.affectedRows + " record(s) updated");
				res.status(200);
				res.json({ token: generatedToken });
			});
		}
	});
})

app.post('/registration', (req, res) => {
	dbConnection.query('SELECT * FROM UserEntity us WHERE us.username = ?', [req.body.username], function (err, result) {
		if (err) throw err;
		if(result.length > 0) {
			res.status(400);
			res.send("Already existing username")
		} else {
			dbConnection.query('INSERT INTO UserEntity(username, password, token) VALUES (?,?,null)', [req.body.username, req.body.password], function (err, result) {
				if (err) throw err;
				var values = [
						[17, result.insertId],
						[30, result.insertId],
						[20, result.insertId],
						[27, result.insertId],
						[28, result.insertId],
						[18, result.insertId],
						[24, result.insertId]
					];
				dbConnection.query('INSERT INTO CharacterToUser(characterId, userId) VALUES ?', [values], function (err, result) {
					if (err) throw err;
				});
			});
			res.status(200);
			res.send("ok");
		}
	});
})

app.post('/availableCharacters', (req, res) => {
	dbConnection.query('SELECT characterId FROM CharacterToUser ctu INNER JOIN UserEntity ue ON ctu.userId = ue.id WHERE ue.token = ?', [req.body.token], function (err, result) {
		if (err) throw err;
		res.status(200);
		res.json(result);
	});
})

app.post('/cancelFindEnemy', (req, res) => {
	dbConnection.query('DELETE FROM FindMatch fm where fm.token1 = ? and fm.token2 is null', [req.body.token], function (err, result) {
		if (err) throw err;
		res.status(200);
		res.json(result);
	});
})

app.get('/test', (req, res) => {
	res.send('<html><head>server Response</head><body><h1> This page was render direcly from the server <p>Hello there welcome to my website</p></h1></body></html>')
})

app.post('/userDetails', (req, res) => {
	dbConnection.query('SELECT * FROM UserEntity ue WHERE ue.username = ?', [req.body.username], function (err, result) {
		if (err) throw err;
		if(result.length > 0) {
			res.status(200);
			res.json({
				username : result[0].username,
				wins: result[0].wins,
				loses: result[0].loses,
				xp: result[0].xp,
				streak: result[0].streak
			});
		} else {
			res.status(400);
		}
	});
})

app.post('/writeMatchResult', (req, res) => {
	dbConnection.query('SELECT * FROM UserEntity ue WHERE ue.username = ?', [req.body.winnerUsername], function (err, result) {
		if (err) throw err;
		if(result.length > 0) {
			let winner = result[0];
			let wins = winner.wins + 1;
			let streak = winner.streak;
			if (streak < 0) {
				streak = 1;
			} else {
				streak = streak + 1;
			}
			let xp = winner.xp + 100;
			dbConnection.query('UPDATE UserEntity SET wins = ?, streak = ?, xp = ? WHERE username = ?', 
						[wins, streak, xp, req.body.winnerUsername], function (err, result) {
				if (err) throw err;
				console.log(result.affectedRows + " record(s) updated win user");
			});
		} else {
			res.status(400);
		}
	});
	dbConnection.query('SELECT * FROM UserEntity ue WHERE ue.username = ?', [req.body.loserUsername], function (err, result) {
		if (err) throw err;
		if(result.length > 0) {
			let looser = result[0];
			let loses = looser.loses + 1;
			let streak = looser.streak;
			if (streak > 0) {
				streak = -1;
			} else {
				streak = streak - 1;
			}
			let xp = looser.xp - 50;
			if(xp < 0) {
				xp = 0;
			}
			dbConnection.query('UPDATE UserEntity SET loses = ?, streak = ?, xp = ? WHERE username = ?', 
						[loses, streak, xp, req.body.loserUsername], function (err, result) {
				if (err) throw err;
				console.log(result.affectedRows + " record(s) updated lose user");
			});
		} else {
			res.status(400);
		}
	});
	res.status(200);
	res.send("ok");
})

app.get('/gameLocation', (req, res) => {
	dbConnection.query('SELECT * FROM ParameterStore ps where ps.name=?', ['gameLocation'], function (err, result) {
		if (err) throw err;
		res.status(200);
		res.send(result[0].paramValue);
	});
})

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/index.html")
})

app.post('/findUserDetailsByTokenForGame', (req, res) => {
	console.log('findUserDetailsByTokenForGame befutott: ' + req.body.token);
	var token = req.body.token;
	dbConnection.query('SELECT * FROM UserEntity us WHERE us.token = ?', [token], function (err, result) {
		if (err) throw err;
		console.log('findUserDetailsByTokenForGame result: ' + result)
		if(result.length > 0) {
			res.status(200);
			res.json({
				//ide usernaem és rank kell egyenlőre, csak olyat küldünk, ami a játékhoz kellhet
				username : result[0].username
			});
		} else {
			res.status(400);
		}
		
	});
});

app.post('/findEnemy', (req, res) => {
	console.log('Start find enemy!');
	// Elkérünk a connection poolbol egy adatbázis connectiont
	dbConnection.getConnection((getConnectionError, connection) => {
	    if (getConnectionError) {
			console.error('Error getting a connection from the pool:', getConnectionError);
			res.status(500).send('An error occurred');
			return;
	    }

		// Indítunk egy tranzakciót, és az izolációt a legszigorúbbra állítjauk(SERIALIZABLE), ez a tábla lockolás miatt kell.
		// Fontos, hogy ez csak erre a tranzakcióra érvényes csak, semmi mást nem befolyásol
	    connection.beginTransaction({ isolationLevel: 'SERIALIZABLE' }, (beginErr) => {
	      	if (beginErr) {
				console.error('Error starting transaction:', beginErr);
				res.status(500).send('An error occurred');
				connection.release();
				return;
	      	}

			// Lock the table
			connection.query('LOCK TABLES FindMatch WRITE', (lockErr) => {
				if (lockErr) {
					console.error('Error locking the table:', lockErr);
						connection.rollback(() => {
						console.log('Transaction rolled back');
						es.status(500).send('An error occurred');
						connection.release();
					});
					return;
				}
				
				connection.query('SELECT * FROM FindMatch where token1 is not null and token2 is null LIMIT 1', function (err, result) {
					if (err) throw err;
					let token = req.body.token;
					let character1 = req.body.character1;
					let character2 = req.body.character2;
					let character3 = req.body.character3;
					console.log(result);
					if(result.length > 0) {
						let findMatchValue = result[0];
						let findMatchValueId = findMatchValue.id;
						connection.query('UPDATE FindMatch SET token2 = ?, player2Character1 = ?, player2Character2 = ?, player2Character3 = ? WHERE id = ?',
						[token, character1, character2, character3, findMatchValueId], function (err, result) {
							if (err) {
								console.error('Error update the table:', err);
							}
							releaseConnectionAndReleaseTableLock(connection, function(){
								// Vissza küldjük az enemy tokenjét
								res.json({
									token1 : findMatchValue.token1,
									player1Character1 : findMatchValue.player1Character1,
									player1Character2 : findMatchValue.player1Character2,
									player1Character3 : findMatchValue.player1Character3,
									token2 : token,
									player2Character1 : character1,
									player2Character2 : character2,
									player2Character3 : character3,
								});
							});
						});
					} else {
						connection.query('INSERT INTO FindMatch(token1, player1Character1, player1Character2, player1Character3, gameMode) VALUES (?,?,?,?,?)', 
						[token, character1, character2, character3, '3'], function (err, result) {
							if (err) {
								console.error('Error update the table:', err);
							}
							releaseConnectionAndReleaseTableLock(connection, function(){
								res.send('NOT_FOUND');
							});
						});
					}
				});
			});
		});
	});
});

app.post('/cancelFindEnemy', (req, res) => {
	// Elkérünk a connection poolbol egy adatbázis connectiont
	dbConnection.getConnection((getConnectionError, connection) => {
	    if (getConnectionError) {
			console.error('Error getting a connection from the pool:', getConnectionError);
			res.status(500).send('An error occurred');
			return;
	    }

		// Indítunk egy tranzakciót, és az izolációt a legszigorúbbra állítjauk(SERIALIZABLE), ez a tábla lockolás miatt kell.
		// Fontos, hogy ez csak erre a tranzakcióra érvényes csak, semmi mást nem befolyásol
	    connection.beginTransaction({ isolationLevel: 'SERIALIZABLE' }, (beginErr) => {
	      	if (beginErr) {
				console.error('Error starting transaction:', beginErr);
				res.status(500).send('An error occurred');
				connection.release();
				return;
	      	}

			// Lock the table
			connection.query('LOCK TABLES FindMatch WRITE', (lockErr) => {
				if (lockErr) {
					console.error('Error locking the table:', lockErr);
						connection.rollback(() => {
						console.log('Transaction rolled back');
						es.status(500).send('An error occurred');
						connection.release();
					});
					return;
				}
				
				connection.query('DELETE FROM FindMatch where token1 = ? and token2 is null', [req.body.token], function (err, result) {
					if (err) throw err;
					releaseConnectionAndReleaseTableLock(connection, function(){
						res.send('CANCELED');
					});
				});
			});
		});
	});
});

/**
 * A connection az egy adatbázis connection, a poolból
 * A callback pedig egy funkcion, amit mindennek a végén végrehajt a kód, vélhetően mindig valami response küldés a kliens felé
 */
function releaseConnectionAndReleaseTableLock(connection, callback) {
	console.log('Start to release connection and table lock!');

	// Unlock the table
	connection.query('UNLOCK TABLES', (unlockErr) => {
		if (unlockErr) {
			console.error('Error unlocking the table:', unlockErr);
		}

		connection.commit((commitErr) => {
			if (commitErr) {
				console.error('Error committing transaction:', commitErr);
				connection.rollback(() => {
					console.log('Transaction rolled back');
					res.status(500).send('An error occurred');
				});
			} else {
				console.log('Transaction committed');
				callback();
			}

			connection.release();
		});
	});
}

server.listen(PORT, () => console.log(`Listening on ${ PORT }`))

server.on('upgrade', (request, socket, head) => {
  webSocketServer.handleUpgrade(request, socket, head, socket => {
    webSocketServer.emit('connection', socket, request);
  });
});

