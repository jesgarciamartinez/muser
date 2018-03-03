import React, { Component } from 'react';
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

const EthIcon = ({ style }) => (
  <svg width="24px" height="24px" viewBox="0 0 256 417" style={style}>
    <g>
      <polygon
        fill="#343434"
        points="127.9611 0 125.1661 9.5 125.1661 285.168 127.9611 287.958 255.9231 212.32"
      />
      <polygon
        fill="#8C8C8C"
        points="127.962 0 0 212.32 127.962 287.959 127.962 154.158"
      />
      <polygon
        fill="#3C3C3B"
        points="127.9611 312.1866 126.3861 314.1066 126.3861 412.3056 127.9611 416.9066 255.9991 236.5866"
      />
      <polygon
        fill="#8C8C8C"
        points="127.962 416.9052 127.962 312.1852 0 236.5852"
      />
      <polygon
        fill="#141414"
        points="127.9611 287.9577 255.9211 212.3207 127.9611 154.1587"
      />
      <polygon
        fill="#393939"
        points="0.0009 212.3208 127.9609 287.9578 127.9609 154.1588"
      />
    </g>
  </svg>
);

const Cards = ({ artists, onInvest, onDetails, balance, goal }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%'
    }}
  >
    {artists.map((artist, index) => (
      <Card key={artist.id} style={{ width: '30%', margin: '1rem' }}>
        <CardTitle />
        <CardMedia aspectRatio="wide" image={artist.picture} />
        <CardTitle title={artist.name} subtitle={artist.genre} />
        {/* Balance only for first Card for demo purposes */}
        <CardText>
          Help <b>{artist.name}</b> raise ETH and be part of their success!
        </CardText>
        <CardText>Goal: {index === 0 ? goal : artist.goal} ETH</CardText>
        <CardText>
          <EthIcon style={{ marginBottom: '-5px' }} />{' '}
          {`${index === 0 ? balance : artist.balance} ETH raised so far.`}
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
    goal: 0,
    dialogActive: false,
    inputValue: 0,

    storageValue: 0,
    web3: null
  };
  web3Provider = null;
  contracts = {};

  toggleDialog = () => {
    const dialogActive = !this.state.dialogActive;
    this.setState({
      dialogActive,
      inputValue: dialogActive ? '' : this.state.inputValue
    });
  };

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState(
          {
            web3: results.web3
          },
          () => {
            this.instantiateContract();
          }
        );

        // Instantiate contract once web3 provided.
      })
      .catch(() => {
        console.log('Error finding web3.');
      });
  }

  instantiateContract = () => {
    this.contracts.Artist = contract(ArtistArtifact.abi);
    // Set the provider for our contract
    this.contracts.Artist.setProvider(this.state.web3.currentProvider);
    this.getBalance();
    this.getGoal();
  };

  handleInvest = () => {
    const { inputValue: investAmount } = this.state;
    var artistInstance;

    // gets metamask accounts of logged user
    this.state.web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }

      this.contracts.Artist.deployed()
        .then(function(instance) {
          artistInstance = instance;

          // Execute adopt as a transaction by sending account
          return artistInstance.makeInvestment(investAmount, {
            gas: 300000,
            from: accounts[0],
            value: this.state.web3.toWei(investAmount, 'ether')
          });
        })
        .catch(function(err) {
          console.log(err.message);
        });
    });
  };

  getBalance = () => {
    this.contracts.Artist.deployed()
      .then(instance => {
        this.setState({
          balance: instance.getContractBalance.call()
        });
      })
      .catch(function(err) {
        console.log(err.message);
      });
  };
  getGoal = () => {
    this.contracts.Artist.deployed().then(instance => {
      this.setState({
        goal: instance.goal.call()
      });
    });
  };

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
            <Cards
              artists={bands}
              onInvest={this.toggleDialog}
              balance={this.state.balance}
              goal={this.state.goal}
            />
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
