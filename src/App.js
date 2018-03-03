import React, { Component } from 'react';
import SimpleStorageContract from '../build/contracts/SimpleStorage.json';
import getWeb3 from './utils/getWeb3';
import {
  AppBar,
  // Checkbox,
  // IconButton,
  Layout,
  NavDrawer,
  Panel,
  // Sidebar,
  Card,
  CardTitle,
  CardMedia,
  CardActions,
  CardText,
  Button
} from 'react-toolbox';

// import './css/oswald.css';
// import './css/open-sans.css';
// import './css/pure-min.css';
// import './App.css';
import bands from './bands.js';

const Cards = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%'
    }}
  >
    {bands.map(band => (
      <Card id={band.id} style={{ width: '30%', margin: '1rem' }}>
        <CardTitle
        // avatar={band.picture}
        // title={band.name}
        // subtitle={band.genre}
        />
        <CardMedia aspectRatio="wide" image={band.picture} />
        <CardTitle title={band.name} subtitle={band.genre} />
        <CardText>{`Help ${
          band.name
        } raise ETH and be part of their success!`}</CardText>
        <CardActions>
          <Button label="Action 1" />
          <Button label="Action 2" />
        </CardActions>
      </Card>
    ))}
  </div>
);

class App extends Component {
  state = {
    drawerActive: false,
    drawerPinned: false,
    sidebarPinned: false,

    storageValue: 0,
    web3: null
  };

  toggleDrawerActive = () => {
    this.setState({ drawerActive: !this.state.drawerActive });
  };

  toggleDrawerPinned = () => {
    this.setState({ drawerPinned: !this.state.drawerPinned });
  };

  toggleSidebar = () => {
    this.setState({ sidebarPinned: !this.state.sidebarPinned });
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
            title={'Nodon'}
            onLeftIconClick={this.toggleDrawerActive}
          />
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.8rem'
            }}
          >
            <Cards />
            {/* <Checkbox
                            label="Pin drawer"
                            checked={this.state.drawerPinned}
                            onChange={this.toggleDrawerPinned}
                        />
                        <Checkbox
                            label="Show sidebar"
                            checked={this.state.sidebarPinned}
                            onChange={this.toggleSidebar}
                        /> */}
          </div>
        </Panel>
        {/* <Sidebar pinned={this.state.sidebarPinned} width={5}>
                    <div>
                        <IconButton icon="close" onClick={this.toggleSidebar} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p>Supplemental content goes here.</p>
                    </div>
                </Sidebar> */}
      </Layout>
    );
  }
}

export default App;
