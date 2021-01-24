import React, {PureComponent} from 'react';
import { createBot, getBot, disconnect } from './connection';

import './App.css';


const LogComponent = React.memo((props) => {
  return <>{props.log.map((l,i) =>
    <div key={i}>
    {l.map((v,k) => <span className="chat-content" style={v.style} key={k}>{v.text}</span>)}
    </div>
  )}</>
});

class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {connected: false, log: [], username: '', password: '', chat: ''};

    this.appendToLog = this.appendToLog.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onError = this.onError.bind(this);
    this.disconnect2 = this.disconnect2.bind(this);
    this.connect = this.connect.bind(this);

    this.logReferences = {
      chatWrapper : React.createRef(),
      bottomLog : React.createRef()
    }
  }

  appendArrayToLog(log) {
      this.setState(st => ({log: [...st.log, log]}));
  }

  appendToLog(log) {
      this.appendArrayToLog([{text: log, style: {color: "white"}}]);
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
              <div className="chat-wrapper" ref={this.logReferences.chatWrapper}>
                <div className="fill"></div>
                <LogComponent log={this.state.log}/>
                <div className="end" ref={this.logReferences.bottomLog}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
