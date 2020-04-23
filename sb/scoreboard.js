var config = {
    apiKey: "AIzaSyBe6FNxH0rYvFHYZKQWjWD_KFyghYGio1Y",
    authDomain: "genericscoreboardapi.firebaseapp.com",
    projectId: "genericscoreboardapi"
};

firebase.initializeApp(config);

var db = firebase.firestore();

isAdmin = false;

mgrData = [];
mgrRows = [];

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        onLoggedIN();
    } else {
        LoginUI();
    }
    mgr = document.getElementById("mgr").modalTrigger;
    if(location.hash.length < 10) mgr.Modal.show();
});

if(location.hash.length > 10) LoadObjectID(location.hash.split("#")[1]);

function createScoreboard() {
    let name = prompt("Enter name of scoreboard:", "Scoreboard");
    if(name === null) return
    if(name === "") name = "Scorebord";
    db.collection("boards").doc().set({
        owner: userId,
        name: name
    });
};

function KEY() {
	prompt("Scoreboard Token :D", ID+"+"+setKey(board));
}

function setKey(board, key = random()) {
	board.collection("secure").doc("keys").set({
        token: key
    });
	return key
}

function onRowClicked(e) {
    LoadObjectID(e.target.parentNode.children[1].innerText);
};

function random(length = 30) {
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var i;
    var result = "";
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    if (window.crypto && window.crypto.getRandomValues) {
        values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        for (i = 0; i < length; i++) {
            result += charset[values[i] % charset.length];
        }
        return result;
    } else {
	if(!isOpera) alert("Your browser can't generate a secure CID");
        for (i = 0; i < length; i++) {
            result += charset[Math.floor(Math.random() * charset.length)];
        }
        return result;
    }
}

function SyncScores(board) {
	rows = [];
	board.collection("players").where("score", ">=", 0).orderBy("score").onSnapshot(snap => {
        snap.docChanges().forEach(change => {
            switch(change.type) {
                case "added":
                    rows[change.doc.id] = scoreboard.insertRow(0);
                    let row1 = rows[change.doc.id];
                    row1.insertCell(0);
                    row1.insertCell(1);
                    row1.cells[0].innerText = change.doc.id;
                    row1.cells[1].innerText = change.doc.data().score;
                    break;
                case "modified":
                    let row2 = rows[change.doc.id];
                    row2.cells[0].innerText = change.doc.id;
                    row2.cells[1].innerText = change.doc.data().score;
                    break;
                case "removed":
                    let row3 = rows[change.doc.id];
                    delete row3[change.doc.id];
                    row3.remove();
                    break;
            }
        });
    })
}

function clearBoard() {
	if(window.hasOwnProperty("scoreboard")) scoreboard.innerHTML = null;
}

async function UI(boardID){
    clearBoard();
    isAdmin = (mgrRows.hasOwnProperty(boardID));
    if(isAdmin) {
        document.getElementById("dbkey").disabled = false;
        document.getElementById("rm").disabled = false;
        try {
            document.getElementById("mgrTable").getElementsByClassName("text-primary")[0].className = "";
        } catch (error) {

        }; 
        mgrRows[boardID].className = "text-primary";
    }
    ID = boardID;
    location.hash = boardID;
}

async function LoadObjectID(boardID) {
    UI(boardID);
	board = db.collection("boards").doc(boardID);
    board.onSnapshot(function(doc) {
		if(!doc.exists) {
			return alert("Board does not exist :(");
		}
		let data = doc.data();
        title.innerText = data.name;
        SyncScores(board);
    });
}

async function onLoggedIN() {
    userId = firebase.auth().currentUser.uid;
    boards = db.collection("boards");
    document.getElementById("body").style.display = "unset";
    document.getElementById("create").disabled = false;
    mgrTable.onclick = onRowClicked;
    boards.where("owner", "==", userId).onSnapshot(function(snap) {
        snap.docChanges().forEach(function(change) {
            switch(change.type) {
                case "added":
                    newMGRRow(change.doc.id);
                    mgrData[change.doc.id].name.innerText = change.doc.data().name;
                    if(location.hash.split("#")[1] === change.doc.id) UI(change.doc.id);
                    break;
                case "modified":
                    mgrData[change.doc.id].name.innerText = change.doc.data().name;
                    if(location.hash.split("#")[1] === change.doc.id) UI(change.doc.id);
                    break;
                case "removed":
                    if(mgrData[change.doc.id]) removeRow(change.doc.id);
                    break;
            }
        });
    }, error => {
        console.error(error);
    });
}

async function removeScoreboard() {
    if(!ID) alert("No scoreboard selected");
    boards.doc(ID).delete();
    removeRow();
}

async function removeRow() {
    delete mgrData[ID];
    mgrRows[ID].remove();
    if(mgrRows[ID].className === "text-primary") clearBoard();
    if(mgrTable.rows.length === 0) {
        location.hash = "";
        document.getElementById("empty").style.display = "unset";
        document.getElementById("dbkey").disabled = true;
        document.getElementById("rm").disabled = true;
    };
}

async function LoginUI() {
    if(firebase.auth().currentUser) return
    ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', {
        signInOptions: [
            firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ]
    });
}

function newMGRRow(ID) {
    document.getElementById("empty").style.display = "none";

    mgrData[ID] = {};
    mgrRows[ID] = {};

    mgrRows[ID] = mgrTable.insertRow(0);
    mgrData[ID].name = mgrRows[ID].insertCell(0);
    mgrRows[ID].insertCell(1).innerText = ID;
}
