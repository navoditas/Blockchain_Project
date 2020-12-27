import React, { Component } from 'react';
import {Switch, Route} from 'react-router-dom';
import './App.css';
import Web3 from 'web3';
import {Header} from './components/Header'
import {Send} from './components/Send'
import {Home} from './components/Home'
import {Search} from './components/Search'
import Users from './abis/Users.json'

class App extends Component {

  async componentDidMount(){
    await this.loadWeb3();
    await this.loadBlockchainData();
    await this.isAuthenticated();
  }


  async loadWeb3(){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      window.ethereum.autoRefreshOnNetworkChange = false
      console.log('Accessed ethereum')
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
      console.log('Accessed current provider')
    }
    else{
      window.alert('Non-ethereum browser detected. Install metamask!!')
    }
  }

  async loadBlockchainData(){
    // Load account
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({account: accounts[0]})

    //Load contract abi and address
    const networkId = await web3.eth.net.getId()
    console.log(networkId)
    const networkData = Users.networks[networkId];
    if(networkData){
      const abi = Users.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      this.setState({contract})
      console.log(contract)
    }else{
      window.alert('Smart contract not deployed to this network!!')
    }
  }

  async isAuthenticated(){
    //query contract and set state
    const rootHash = await this.state.contract.methods.readHash().call()
    console.log(rootHash)
    if(rootHash===''){
      this.setState({isAuth: false})
    }else{
      this.setState({isAuth:true})
    }
  }

  constructor(props){
    super(props);
    this.state = {
      account: '0xQuixoticDoppleganger', // current account retreived from metamask
      contract: null, // current abi in use
      isAuth: false, // is the current user present in our blockchain??
    };
    this.setAuthTrue = this.setAuthTrue.bind(this);
    this.setAuthFalse = this.setAuthFalse.bind(this);
  }

  setAuthTrue(){this.setState({isAuth: true})}
  setAuthFalse(){
    this.setState({isAuth: false})
    console.log(this.state.isAuth)
  }

  render() {
    return (
        <div className="App">
          <Header account={this.state.account}/>
          <Switch>
            <Route exact path="/" 
              render={(props) => 
                (<Home {...props} 
                  data={this.state}
                  handle={this.setAuthTrue}
                />)} 
            />
            <Route exact path="/send"  
              render={(props) => 
                (<Send {...props} 
                  data={this.state}
                  handle={this.setAuthFalse}
                />)}
            />
            <Route exact path="/search" 
              render={(props) =>
                (<Search {...props}
                  data={this.state} 
                />)} 
            />
            <Route render={() => <p>Page not found!</p>} />
          </Switch>
        </div> 
    );
  }
}

export default App;
