import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Page, Dimmer, Header, Container } from "tabler-react";

import ReactNotification from "react-notifications-component";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

import SiteWrapper from "./pages/SiteWrapper.react";
import Dashboard from "./pages/dashboard/Dashboard";
import Product from "./pages/product/Product";

import SupplyingProcess from "./pages/process/SupplyingProcess";
import ProductionProcess from "./pages/process/ProductionProcess";

import ManageProduct from "./pages/product/ManageProduct";
import EventsLogStream from "./pages/log/EventsLogStream";
import EventsLogNonStream from "./pages/log/EventsLogNonStream";

import DIDResolver from "./pages/DID/DIDResolver";
import VCResolver from "./pages/DID/VCResolver";

import Machine from "./pages/machine/Machine";
import MachineTasks from "./pages/machine/MachineTasks";
import ManageMachine from "./pages/machine/ManageMachine";
import MachineReadings from "./pages/machine/MachineReadings";
import MachineAlerts from "./pages/machine/MachineAlerts";
import MachineMaintenanceOperations from "./pages/machine/MachineMaintenanceOperations";

import ConnectionContext from "./pages/utilities/ConnectionContext";
import ContractsLoader from "./pages/utilities/ContractsLoader";

import "tabler-react/dist/Tabler.css";
import "react-notifications-component/dist/theme.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  handleChainChanged(_chainId) {
    var web3 = this.state.web3;
    if (typeof web3 === "undefined" || web3 === null) {
      this.setState({ errorMessage: "Web3 is null.", loading: false });
    } else {
      ContractsLoader.load(web3)
        .then((contracts) => {
          this.setState({
            web3: web3,
            provider: this.state.provider,
            contracts: contracts,
            loading: false,
            errorMessage: null,
          });
        })
        .catch((error) => {
          this.setState({ errorMessage: error, loading: false });
        });
    }
  }

  componentDidMount() {
    document.title = "App";
    detectEthereumProvider({ timeout: 3000, silent: false })
      .then((provider) => {
        if (provider == null) {
          this.setState({
            errorMessage: "MetaMask is not installed.",
            loading: false,
          });
        } else {
          provider.autoRefreshOnNetworkChange = false;
          var web3 = new Web3(provider || "ws://localhost:23000");
          web3.eth.handleRevert = true;
          this.setState({ provider: provider, loading: true, web3: web3 });
          provider.on("chainChanged", this.handleChainChanged.bind(this));
          this.handleChainChanged(null);
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          errorMessage: "MetaMask is not installed.",
          loading: false,
        });
      });
  }

  render() {
    if (this.state.loading) {
      return (
        <Page className="text-center">
          <Container>
            <Dimmer active loader />
          </Container>
        </Page>
      );
    }

    if (this.state.errorMessage != null) {
      return (
        <Page className="text-center">
          <Container>
            <Header.H1 className="display-1 text-muted mb-5">
              {"Oops! Something Went Wrong!"}
            </Header.H1>
            <Header.H2>{this.state.errorMessage}</Header.H2>
          </Container>
        </Page>
      );
    }

    return (
      <ConnectionContext.Provider
        value={{
          provider: this.state.provider,
          web3: this.state.web3,
          contracts: this.state.contracts,
        }}
      >
        <Router>
          <ReactNotification />
          <SiteWrapper>
            <Switch>
              <Route exact path="/">
                <Dashboard />
              </Route>
              <Route exact path="/machine/:machine?">
                <Machine />
              </Route>
              <Route exact path="/:machine/manage">
                <ManageMachine />
              </Route>
              <Route exact path="/:machine/tasks">
                <MachineTasks />
              </Route>
              <Route exact path="/:machine/readings">
                <MachineReadings />
              </Route>
              <Route exact path="/:machine/alerts">
                <MachineAlerts />
              </Route>
              <Route exact path="/:machine/operations">
                <MachineMaintenanceOperations />
              </Route>
              <Route exact path="/product">
                <Product />
              </Route>
              <Route exact path="/supplying-process">
                <SupplyingProcess />
              </Route>
              <Route exact path="/production-process">
                <ProductionProcess />
              </Route>
              <Route exact path="/manageProduct">
                <ManageProduct />
              </Route>
              <Route exact path="/events-log-stream">
                <EventsLogStream />
              </Route>
              <Route exact path="/events-log-non-stream">
                <EventsLogNonStream />
              </Route>
              <Route exact path="/did-resolver/:address?">
                <DIDResolver />
              </Route>
              <Route exact path="/operation-vc-resolver/:operationID?">
                <VCResolver />
              </Route>
            </Switch>
          </SiteWrapper>
        </Router>
      </ConnectionContext.Provider>
    );
  }
}

export default App;
