const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const { Server } = require("socket.io");
const io = new Server(express);
const DHT = require("@hyperswarm/dht");
const hypercore = require('hypercore');
const SDK = require('hyper-sdk');

// includes code from https://glitch.com/edit/#!/hyper-chat-server (with permission from @Water - thanks)

let key
let privatekey
let keyPair

(async () => {
  const sdk = await SDK({});
  const core = new sdk.Hypercore('chatlog');
  core.ready().then(()=>{
      console.log({key:core.key.toString('hex'), length:core.length});
      key = core.key.toString('hex')
      privatekey  =core.secretKey.toString('hex')
      keyPair = {
      publicKey: Buffer.from(key, "hex"),
      secretKey: Buffer.from(privatekey, "hex")
      console.log("keyPair:", keyPair);
  };
  })
  const node = new DHT();



  const server = node.createServer();
  const sockets = [];

  server.on("connection", function(socket) {
    let name = "";
    socket.on("data", json => {
      const text = JSON.parse(json).text;
      console.log(text)
      core.append(JSON.stringify({text:text.replace(/(<([^>]+)>)/gi, "")}));
    });
    sockets.push(socket);
  });
  await server.listen(keyPair);
})();



app.get('/', (req, res) => res.send("A response (to add a 'get' from a hypercore"))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
