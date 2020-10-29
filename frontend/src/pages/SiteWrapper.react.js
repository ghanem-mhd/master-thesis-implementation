// @flow

import * as React from "react";
import { NavLink, withRouter } from "react-router-dom";

import {
  Site,
  Nav,
  Button,
  Grid,
  List,
} from "tabler-react";

import ConnectionContext from './utilities/ConnectionContext';
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
    LinkComponent: withRouter(({staticContext, ...props}) => { return <NavLink {...props}/>}),
    useExact: true,
  },
  {
    value: "Machines",
    icon: "monitor",
    to: "/machine",
    LinkComponent: withRouter(({staticContext, ...props}) => { return <NavLink {...props}/>}),
  },
  {
    value: "Products",
    icon: "shopping-bag",
    to: "/product",
    LinkComponent: withRouter(({staticContext, ...props}) => { return <NavLink {...props}/>}),
  },
  {
    value: "Processes",
    icon: "server",
    to: "/process",
    LinkComponent: withRouter(({staticContext, ...props}) => { return <NavLink {...props}/>}),
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
    this.provider.request({ method: 'eth_accounts' }).then(this.handleAccountsChanged.bind(this))
    .catch((err) => {
      console.error(err);
    });
    this.provider.on('accountsChanged', this.handleAccountsChanged.bind(this));
  }

  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      Misc.showAccountNotConnectedNotification(store);
    } else{
      this.setState({currentAccount: accounts[0]});
    }
  }

  connect() {
    this.provider
      .request({ method: 'eth_requestAccounts' })
      .then(this.handleAccountsChanged.bind(this))
      .catch((err) => {
        console.error(err);
      });
  }

  render(): React.Node {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          const { provider} = connectionContext;
          this.provider = provider;
          return (
            <Site.Wrapper
              headerProps={{
                href: "/",
                alt: "Tabler React",
                imageURL: "/tabler.svg",
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
              footerProps={{
                copyright: (
                  <React.Fragment>
                    Copyright © 2019
                    <a href="."> Tabler-react</a>. Theme by
                    <a
                      href="https://codecalm.net"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      codecalm.net
                    </a>{" "}
                    All rights reserved.
                  </React.Fragment>
                ),
                nav: (
                  <React.Fragment>
                    <Grid.Col auto={true}>
                      <List className="list-inline list-inline-dots mb-0">
                        <List.Item className="list-inline-item">
                          <a href="./docs/index.html">Documentation</a>
                        </List.Item>
                        <List.Item className="list-inline-item">
                          <a href="./faq.html">FAQ</a>
                        </List.Item>
                      </List>
                    </Grid.Col>
                    <Grid.Col auto={true}>
                      <Button
                        href="https://github.com/tabler/tabler-react"
                        size="sm"
                        outline
                        color="primary"
                        RootComponent="a"
                      >
                        Source code
                      </Button>
                    </Grid.Col>
                  </React.Fragment>
                ),
              }}>
              {this.props.children}
            </Site.Wrapper>
          )
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default SiteWrapper;
