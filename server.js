const express = require('express');
const app = express();

var admin = require("firebase-admin");

var serviceAccount = require("LOCAL FILE");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://genericscoreboardapi.firebaseio.com"
});

var db = admin.firestore();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(express.json());

app.get('/', (req, res, next) => {
	res.send("Hello World");
});

function increment(board, username = "Unnamed Player", number = 1) {
	let player = board.collection("players").doc(username);
	number = Number.parseInt(number);
	if(isNaN(number)) return "Increment value not valid";
	player.update({
		score: admin.firestore.FieldValue.increment(number)
	}).catch(_ => {
		player.set({
			score: number
		});
	})
	return "OK";
}

app.post('/api', async (req, res, next) => {
	let board = await AuthUser(req.body.token);
	if(board === null) return res.json("AUTH FAILED");
	if(req.body.increment) {
		let result = increment(board, req.body.username, req.body.increment);
		return res.json(result);
	}
	res.json("NO ACTION");
});

async function AuthUser(token) {
	if(!token) return null;
	let auth = token.split("+");
	if(auth.length !== 2) return null
	let board = await getBoard(auth[0]);
	if(board === null) return null
	let keys = await board.collection("secure").doc("keys").get();
	if(auth[1] !== keys.data().token) return null
	return board;
}

async function getBoard(ID) {
	let board = db.collection("boards").doc(ID);
	let Snapshot = await board.get();
	return (Snapshot.exists) ? board : null
}

module.exports = app;
