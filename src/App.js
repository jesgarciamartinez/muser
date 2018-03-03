import React, { Component } from 'react';
import SimpleStorageContract from '../build/contracts/SimpleStorage.json';
import ArtistArtifact from '../build/contracts/Artist.json';
const contract = require('truffle-contract');

import getWeb3 from './utils/getWeb3';
import {
  AppBar,
  Layout,
  NavDrawer,
  Panel,
  Card,
  CardTitle,
  CardMedia,
  CardActions,
  CardText,
  Button,
  Dialog,
  Input
} from 'react-toolbox';

import bands from './bands.js';

const Cards = ({ artists, onInvest, onDetails }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%'
    }}
  >
    {artists.map(artist => (
      <Card id={artist.id} style={{ width: '30%', margin: '1rem' }}>
        <CardTitle />
        <CardMedia aspectRatio="wide" image={artist.picture} />
        <CardTitle title={artist.name} subtitle={artist.genre} />
        <CardText>
          Help <b>{artist.name}</b> raise ETH and be part of their success!
        </CardText>
        <CardActions>
          <Button label="Invest" onClick={onInvest} />
          <Button label="Details" onClick={onDetails} />
        </CardActions>
      </Card>
    ))}
  </div>
);

class App extends Component {
  state = {
    // drawerActive: false,
    balance: 0,
    dialogActive: false,
    inputValue: 0,

    storageValue: 0,
    web3: null
  };

  toggleDialog = () => {
    const dialogActive = !this.state.dialogActive;
    this.setState({
      dialogActive,
      inputValue: dialogActive ? '' : this.state.inputValue
    });
  };

  componentDidMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });

        // Instantiate contract once web3 provided.
        this.instantiateContract();
      })
      .catch(() => {
        console.log('Error finding web3.');
      });
  }

  instantiateContract() {
    this.contracts.Artist = contract(ArtistArtifact);
    // Set the provider for our contract
    this.contracts.Artist.setProvider(App.web3Provider);
    this.getBalance();
  }
  handleInvest() {
    const { inputValue: investAmount } = this.state;
    var artistInstance;

    // gets metamask accounts of logged user
    this.state.web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      App.contracts.Artist.deployed()
        .then(function(instance) {
          artistInstance = instance;

          // Execute adopt as a transaction by sending account
          return artistInstance.makeInvestment(investAmount, {
            gas: 300000,
            from: accounts[0],
            value: this.state.web3.toWei(investAmount, 'ether')
          });
        })
        .then(function(result) {
          return App.markAdopted();
        })
        .catch(function(err) {
          console.log(err.message);
        });
    });
  }

  getBalance() {
    this.contracts.Artist.deployed()
      .then(instance => {
        this.setState({
          balance: instance.getContractBalance.call()
        });
      })
      .catch(function(err) {
        console.log(err.message);
      });
  }

  render() {
    return (
      <Layout>
        <NavDrawer
          active={this.state.drawerActive}
          pinned={this.state.drawerPinned}
          permanentAt="xxxl"
          onOverlayClick={this.toggleDrawerActive}
        >
          {/* <p>Navigation, account switcher, etc. go here.</p> */}
        </NavDrawer>
        <Panel>
          <AppBar
            leftIcon="menu"
            title={'Muser'}
            onLeftIconClick={this.toggleDrawerActive}
          />
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.8rem'
            }}
          >
            <Cards artists={bands} onInvest={this.toggleDialog} />
          </div>
        </Panel>
        <Dialog
          active={this.state.dialogActive}
          onEscKeyDown={this.toggleDialog}
          onOverlayClick={this.toggleDialog}
          title={'Enter an ETH amount'}
        >
          <form>
            <Input
              type={'number'}
              value={this.state.inputValue}
              label={'ETH'}
              onChange={inputValue => {
                this.setState({ inputValue });
              }}
              innerRef={input => {
                if (!input) return;
                input.focus();
              }}
            />
            <Button label={'Ok!'} primary raised onClick={this.handleInvest} />
            <Button label={'Cancel'} accent onClick={this.toggleDialog} />
          </form>
        </Dialog>
      </Layout>
    );
  }
}

export default App;
