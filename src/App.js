import React, {Component} from 'react';
import { createBot, getBot, disconnect } from './connection';

import './App.css';
import { mcChatToString } from './util';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {connected: false, log: [], username: '', password: '', chat: ''};

    this.appendToLog = this.appendToLog.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onError = this.onError.bind(this);
    this.disconnect2 = this.disconnect2.bind(this);
    this.connect = this.connect.bind(this);
    this.sendChat = this.sendChat.bind(this);
    this.onChat = this.onChat.bind(this);
  }

  appendToLog(log) {
    this.setState(st => ({log: [...st.log, log]}))
  }

  connect() {
    this.appendToLog("connecting");
    if (!this.state.connected) 
      createBot(this.state.username, this.state.password, this.onConnect, this.onDisconnect, this.onError);
  } 

  disconnect2() {
    if (getBot() === undefined) return;
    disconnect();
    this.setState({connected: false});
    this.appendToLog("disconnected from hypixel");
  }

  onConnect() {
    this.setState({connected: true});
    this.appendToLog("connected to hypixel");

    getBot()._client.removeListener('chat', this.onChat);
    getBot()._client.on('chat', this.onChat);
  }

  onChat(packet) {
    if (packet.position === 2) return;
    console.log(packet.message);
    try {
      this.appendToLog(mcChatToString(JSON.parse(packet.message)));
    } catch (e) {
      this.appendToLog(packet.message);
    }
  }

  onDisconnect(reason) {
    this.setState({connected: false});
    disconnect();
    this.appendToLog("disconnected - reason: "+reason);
  }
  onError(err) {
    disconnect();
    this.setState({connected: false});
    if (err instanceof Error) {
      this.appendToLog("error occured, "+err.message);
    } else {
      this.appendToLog("error occured, "+err);
    }
    console.log(err);
  }

  sendChat() {
    const chat = this.state.chat.trim();
    if (chat.startsWith("/p")) {
      this.appendToLog("please no command that starts with /p");
      return;
    } else if (chat.startsWith("/lobby") || chat.startsWith("/zoo")) {
      this.appendToLog("please no lobby commands");
      return;
    } else {
      getBot().chat(this.state.chat);
    }

    this.setState({chat: ''});
  }

  render() {
    return (
      <div className="container">
        <div className="TitleBar">
          <h1 className="title">
            Zombies Help Starter Account Provider
          </h1>
          <p className="disclaimer">
            - connection to hypixel is directly made from this program<br/>
            - not even a single part of your credential is sent to the dev's server
          </p>
        </div>
        <hr className="divider"/>
        <div className="content">
          <div className="accountInformation">
            <h2>Minecraft Credentials</h2>
            <div className="credential">
              <p>username</p>
              <input type="text" className="credential" placeholder="minecraft username" value={this.state.username} onChange={(ev) => this.setState({username: ev.target.value})}/>
            </div>
            <div className="credential">
              <p>password</p>
              <input type="password" className="credential" placeholder="minecraft password" value={this.state.password} onChange={(ev) => this.setState({password: ev.target.value})}/>
            </div>
            <button className="disconnect" onClick={this.connect}>Connect</button>
            <button className="disconnect" onClick={this.disconnect2}>Disconnect</button>
            <hr className="divider"/>
            <h2>Current Status</h2>
            <p>{this.state.connected ? "Connected" : "Disconnected"}</p>
          </div>
          <hr className="divider"/>
          <div className="chat">
            <h2>Chat / Log</h2>
            <div className="chat-wrapper-wrapper">
              <div className="chat-wrapper">
                <div className="fill"></div>
                {this.state.log.map((l,i) => <span className="chat-content" key={i}>{l}</span>)}
              </div>
            </div>
            
            <div className="credential">
              <input type="text" className="credential" placeholder="chat" value={this.state.chat} onChange={(ev) => this.setState({chat: ev.target.value})}/>
              <button className="send" onClick={this.sendChat}>send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
