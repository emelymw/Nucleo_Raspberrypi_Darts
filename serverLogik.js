//Init WebsockeServer
const WebSocket = require("ws")
const wss = new WebSocket.Server({ port: 8080 }); // abgespilteter WS Server auf anderem Port

//Init Express Server
const express = require('express')
const server = express()
//Port
const port = 3443
//Greife immer auf public zu 
server.use(express.static('public'));
//Höre auf Port
server.listen(port, () => {
  console.log(`App listening at http://raspberrypi:${port}`) // Publisher Server auf Port 3443
});
//Init BodyParser
let bodyParser = require('body-parser');
server.use(bodyParser.json());


//Globale Variablen
let incomingNumberPlayerOne = 0;
let multiplPlayerOne = 0;
let ergebnisPlayerOne = 0;
let stringErgebnisPlayerOne;

server.get('/' , function ( request, response){
    console.log("Eingehende get request");
    response.sendStatus(200);
});

server.post('/', function (req, res) {
    incomingNumberPlayerOne = req.body.numberPL1;
    multiplPlayerOne = req.body.mulPL1;
    ergebnisPlayerOne = multiplPlayerOne * incomingNumberPlayerOne;
    //Debug
    console.log("Incoming: NumberPl1 " + incomingNumberPlayerOne + " MultiplierPL1: " + multiplPlayerOne + 
    " Ergebnis: " + ergebnisPlayerOne)
    //Ermittle Double/Tripple/Single
    stringErgebnisPlayerOne = ermittleFeld(incomingNumberPlayerOne, multiplPlayerOne);
    //verteile Ergebnis
    broadcast(ergebnisPlayerOne, stringErgebnisPlayerOne);
    //Antwort Server
    res.send("Kam an Ergebnis: " + stringErgebnisPlayerOne);
});

//Sagt euch wenn ein Client verbunden ist oder wenn er disconnected
wss.on("connection", ws => {
    console.log("Client connected!");
  
    ws.on("close", data => {
      console.log("Client has disconnceted");
    })
  
  })

// diese funktion schickt das übergebene Objekt json an alle verbundenen Clients
function broadcast(numberErgebnis, stringErgebnis) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        console.log("sende");
        client.send(JSON.stringify({ type: 'numberErgebnis', value: numberErgebnis }));
        client.send(JSON.stringify({ type: 'stringErgebnis', value: stringErgebnis }));
      }
    });
}

function ermittleFeld(number, mul){
    switch(mul){
        case 1: return String('S' + number);
        
        case 2: return String('D' + number);

        case 3: return String('T' + number);
    }
}