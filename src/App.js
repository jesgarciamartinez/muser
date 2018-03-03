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
        <CardText>{`Help ${
          artist.name
        } raise ETH and be part of their success!`}</CardText>
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
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract');
    const simpleStorage = contract(SimpleStorageContract);
    simpleStorage.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage
        .deployed()
        .then(instance => {
          simpleStorageInstance = instance;

          // Stores a given value, 5 by default.
          return simpleStorageInstance.set(5, { from: accounts[0] });
        })
        .then(result => {
          // Get the value from the contract to prove it worked.
          return simpleStorageInstance.get.call(accounts[0]);
        })
        .then(result => {
          // Update state with the result.
          return this.setState({ storageValue: result.c[0] });
        });
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
          <Input type={'number'} />
        </Dialog>
      </Layout>
    );
  }
}

export default App;
