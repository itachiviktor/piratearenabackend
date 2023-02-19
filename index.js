const express = require('express')
const app = express()
const mysql = require('mysql');
const uuid = require('uuid');
const path = require('path');
const PORT = process.env.PORT || 5000  

var webSocketServer = new (require('ws')).Server({port: 5001}),
    webSockets = {} // userID: webSocket

// CONNECT /:userID
// wscat -c ws://localhost:5000/1
webSocketServer.on('connection', function (webSocket, request) {
  var userID = JSON.stringify(request.url).replace('/', '');
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
    console.log('received from ' + userID + ': ' + message)
    //var messageArray = JSON.parse(message)
    var toUserWebSocket = webSockets[0];
    if (toUserWebSocket) {
      //console.log('sent to ' + messageArray[0] + ': ' + JSON.stringify(messageArray))
      //messageArray[0] = userID
      //toUserWebSocket.send(JSON.stringify(messageArray));
      toUserWebSocket.send(message);
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
			});
			res.status(200);
			res.json({ token: generatedToken });
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

app.get('/test', (req, res) => {
	res.send('<html><head>server Response</head><body><h1> This page was render direcly from the server <p>Hello there welcome to my website</p></h1></body></html>')
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


app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
