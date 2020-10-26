// @flow

import * as React from "react";
import { NavLink, withRouter } from "react-router-dom";

import {
  Site,
  Nav,
  Button,
  RouterContextProvider,
} from "tabler-react";

import { store } from 'react-notifications-component';
import Misc from './utilities/Misc';

type Props = {|
  +children: React.Node,
|};


type subNavItem = {|
  +value: string,
  +to?: string,
  +icon?: string,
  +LinkComponent?: React.ElementType,
  +useExact?: boolean,
|};

type navItem = {|
  +value: string,
  +to?: string,
  +icon?: string,
  +active?: boolean,
  +LinkComponent?: React.ElementType,
  +subItems?: Array<subNavItem>,
  +useExact?: boolean,
|};

const navBarItems: Array<navItem> = [
  {
    value: "Home",
    to: "/",
    icon: "home",
    LinkComponent: withRouter(NavLink),
    useExact: true,
  },
  {
    value: "Machines",
    icon: "monitor",
    subItems: [
      { value: "VGR", to: "/VGR", LinkComponent: NavLink },
      { value: "HBW", to: "/HBW", LinkComponent: NavLink },
      { value: "MPO", to: "/MPO", LinkComponent: NavLink },
      { value: "SLD", to: "/SLD", LinkComponent: NavLink },
    ]
  },
  {
    value: "Products",
    icon: "shopping-bag",
    to: "/product",
    LinkComponent: withRouter(NavLink),
  },
  {
    value: "Processes",
    icon: "server",
    to: "/process",
    LinkComponent: withRouter(NavLink),
  },
  {
    value: "Settings",
    icon: "settings",
  }
];

class SiteWrapper extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      currentAccount: null,
    }
  }

  componentDidMount(){
    const provider = this.props.provider;
    provider.request({ method: 'eth_accounts' }).then(this.handleAccountsChanged.bind(this))
    .catch((err) => {
      console.error(err);
    });
    provider.on('accountsChanged', this.handleAccountsChanged.bind(this));
  }

  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      Misc.showAccountNotConnectedNotification(store);
    } else{
      this.setState({currentAccount: accounts[0]});
    }
  }

  connect() {
    this.props.provider
      .request({ method: 'eth_requestAccounts' })
      .then(this.handleAccountsChanged.bind(this))
      .catch((err) => {
        console.error(err);
      });
  }

  render(): React.Node {

    return (
      <Site.Wrapper
        headerProps={{
          href: "/",
          alt: "Tabler React",
          imageURL: "./tabler.svg",
          navItems: (
            <div>
            {
              this.state.currentAccount && <div>{"Current Account: "}{this.state.currentAccount}</div>
            }{
              !this.state.currentAccount &&
              <Nav.Item type="div" className="d-none d-md-flex">
                <Button size="sm" color="primary" onClick={this.connect.bind(this)}>Connect</Button>

              </Nav.Item>
            }
            </div>
          )
        }}
        navProps={{ itemsObjects: navBarItems }}
        routerContextComponentType={withRouter(RouterContextProvider)}
      >
        {this.props.children}
      </Site.Wrapper>
    );
  }
}

export default SiteWrapper;
