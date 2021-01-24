
import { mcChatToString } from './util';

const mineflayer = window.require('electron').remote.require('mineflayer');
const Vec3 = window.require('electron').remote.require('vec3').Vec3;
var rateLimit = require('function-rate-limit');



var bot;

var websocket;

export function createBot(username, password, onConnect, onDisconnect, onError) {
    bot = mineflayer.createBot({
        host: 'mc.hypixel.net',
        port: 25565,
        username: username,
        password: password,
        version: "1.8.9"
    })

    bot.on('disconnect', onDisconnect);
    bot.on('error', onError);
    bot._client.on('chat', onChat);
    bot.once('spawn', () => connect(onError, onConnect));

    return bot;
}

export function disconnect() {
    bot.quit();
    websocket.close(3000, "intentional");
}

var sendMessage = rateLimit(1, 200, function(x) {
    bot.chat(x);
})

var difficultySlot = 0;

function connect(onDisconnect, onConnect) {
    websocket = new WebSocket('ws://zzsuperzz.ddns.net:25560');
    websocket.onopen = function() {
      websocket.send(JSON.stringify({
          command: "connect",
          data: bot.username 
      }));
      onConnect();
    };
  
    websocket.onmessage = function(e) {
      console.log('Message:', e.data);
      const data = JSON.parse(e.data);
      if (data.command === "chat") {
        sendMessage(data.data);
      } else if (data.command === "difficulty") {
        difficultySlot = data.data === "HARD" ? 13 : data.data === "RIP" ? 15 : 0;
        
        setTimeout(() => {
            bot.setQuickBarSlot(4);
            bot.once('windowOpen', function (window) {
                bot.clickWindow(difficultySlot, 0, 0);
            })
            setTimeout(() => {
                bot.swingArm("right");
            }, 1000);
        }, 1000);

      } else if (data.command === "open") {
          
            const block = bot.blockAt(new Vec3(data.data[0],data.data[1],data.data[2]));
            bot.activateBlock(block);
      }
    };
  
    websocket.onclose = function(e) {
        if (e.reason === "intentional") return;
        if (e.reason === "Couldn't get invited") {
            onDisconnect(e.reason);
            return;
        } else if (e.reason === "not following directions bot") {
            onDisconnect(e.reason);
            return;
        } else if (e.reason === "not following directions") {
            onDisconnect(e.reason);
            return;
        }
      console.log('Socket is closed. Reconnect will be attempted in 10 second.', e.reason);
      setTimeout(function() {
        connect(onDisconnect, onConnect);
      }, 10000);
    };
  
    websocket.onerror = function(err) {
      console.error('Socket encountered error: ', err.message, 'Closing socket and bot');
      disconnect();
      onDisconnect(err);
    };
}
  
function onChat(packet) {
    if (packet.position === 2) return;
    var msg;
    try {
        msg = mcChatToString(JSON.parse(packet.message));
    } catch (e) {
        msg = packet.message;
    }
    if (websocket !== undefined && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
            command: "chatReceived",
            data: msg
        }))
    }
}


export function getBot() {
    return bot;
}
