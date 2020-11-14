import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Page, Dimmer, Container } from "tabler-react";

import ReactNotification from "react-notifications-component";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

import SiteWrapper from "./pages/SiteWrapper.react";
import Dashboard from "./pages/dashboard/Dashboard";
import Product from "./pages/product/Product";

import SupplyingProcess from "./pages/process/SupplyingProcess";
import ProductionProcess from "./pages/process/ProductionProcess";
import ProcessInstances from "./pages/process/ProcessInstances";

import CreateProduct from "./pages/product/CreateProduct";
import EventsLogStream from "./pages/log/EventsLogStream";
import EventsLogNonStream from "./pages/log/EventsLogNonStream";

import DIDResolver from "./pages/DID/DIDResolver";
import VCResolver from "./pages/DID/VCResolver";

import MachinesRegistry from "./pages/machine/MachinesRegistry";
import Machine from "./pages/machine/Machine";
import MachineTasks from "./pages/machine/MachineTasks";
import ManageMachine from "./pages/machine/ManageMachine";
import MachineReadings from "./pages/machine/MachineReadings";
import MachineAlerts from "./pages/machine/MachineAlerts";
import MachineMaintenanceOperations from "./pages/machine/MachineMaintenanceOperations";

import ConnectionContext from "./pages/utilities/ConnectionContext";
import ContractsLoader from "./pages/utilities/ContractsLoader";

import ErrorPage from "./pages/utilities/ErrorPage";

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
            contracts: contracts.metamaskProvider,
            wsContracts: contracts.wsProvider,
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
          var web3 = new Web3(provider || process.env.REACT_APP_WS_NETWORK);
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
      return <ErrorPage errorMessage={this.state.errorMessage} />;
    }

    return (
      <ConnectionContext.Provider
        value={{
          provider: this.state.provider,
          web3: this.state.web3,
          contracts: this.state.contracts,
          registry: this.state.contracts["Registry"],
          wsContracts: this.state.wsContracts,
        }}
      >
        <Router>
          <ReactNotification />
          <SiteWrapper>
            <Switch>
              <Route exact path="/">
                <Dashboard />
              </Route>
              <Route exact path="/machines">
                <MachinesRegistry />
              </Route>
              <Route exact path="/machine/:address">
                <Machine />
              </Route>
              <Route exact path="/machine/:address/manage">
                <ManageMachine />
              </Route>
              <Route exact path="/machine/:address/tasks">
                <MachineTasks />
              </Route>
              <Route exact path="/machine/:address/readings">
                <MachineReadings />
              </Route>
              <Route exact path="/machine/:address/alerts">
                <MachineAlerts />
              </Route>
              <Route exact path="/machine/:address/operations">
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
              <Route exact path="/:process/instances">
                <ProcessInstances />
              </Route>
              <Route exact path="/create-product">
                <CreateProduct />
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
