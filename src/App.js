import React, { Component } from 'react';
import SimpleStorageContract from '../build/contracts/SimpleStorage.json';
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
        <CardText>{"Help "
          +artist.name+
         "raise ETH and be part of their success!"}</CardText>
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
    dialogActive: false,

    storageValue: 0,
    web3: null
  };

  toggleDialog = () => {
    this.setState({
      dialogActive: !this.state.dialogActive
    });
  };

  componentWillMount() {
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
    const contract = require('truffle-contract')

    $.getJSON('Artist.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ArtistArtifact = data;
      App.contracts.Artist = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Artist.setProvider(App.web3Provider);
      return App.getBalance();
    });

    return App.bindEvents();
  }

  bindEvents () {
    $(document).on('click', '.btn-invest', App.handleInvest);
  },

  handleInvest(event) {
    event.preventDefault();

    var investAmount = parseInt($(event.target).data('amount'));

    var artistInstance;

    // gets metamask accounts of logged user
    this.state.web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Artist.deployed().then(function(instance) {
        artistInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.makeInvestment(investAmount, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

  getBalance(balance) {
    var artistInstance;

    App.contracts.Artist.deployed().then(function(instance) {
      artistInstance = instance;

      return artistInstance.getContractBalance.call();
    }).then(function(balance) {
      return balance;
    }).catch(function(err) {
      console.log(err.message);
    });
  },

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
          <Input type={'number'} />
        </Dialog>
      </Layout>
    );
  }
}

export default App;
