// @flow

import * as React from "react";
import { NavLink, withRouter } from "react-router-dom";

import { Site, Nav, Button, Grid, List } from "tabler-react";

import ConnectionContext from "./utilities/ConnectionContext";
import AddressResolver from "./utilities/AddressResolver";
import { store } from "react-notifications-component";
import Misc from "./utilities/Misc";

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
    value: "Dashboard",
    to: "/",
    icon: "home",
    LinkComponent: withRouter(({ staticContext, ...props }) => {
      return <NavLink {...props} />;
    }),
    useExact: true,
  },
  {
    value: "Machines",
    icon: "monitor",
    to: "/machines",
    LinkComponent: withRouter(({ staticContext, ...props }) => {
      return <NavLink {...props} />;
    }),
  },
  {
    value: "Products",
    icon: "shopping-bag",
    to: "/products",
    LinkComponent: withRouter(({ staticContext, ...props }) => {
      return <NavLink {...props} />;
    }),
  },
  {
    value: "Processes",
    icon: "server",
    to: "/processes",
    LinkComponent: withRouter(({ staticContext, ...props }) => {
      return <NavLink {...props} />;
    }),
  },
  {
    value: "Resolver",
    icon: "search",
    subItems: [
      {
        value: "DID Resolver",
        to: "/did-resolver",
        LinkComponent: withRouter(({ staticContext, ...props }) => {
          return <NavLink {...props} />;
        }),
      },
      {
        value: "VC Resolver",
        to: "/operation-vc-resolver",
        LinkComponent: withRouter(({ staticContext, ...props }) => {
          return <NavLink {...props} />;
        }),
      },
    ],
  },
  {
    value: "Events Log",
    icon: "rss",
    to: "/events-explorer",
    LinkComponent: withRouter(({ staticContext, ...props }) => {
      return <NavLink {...props} />;
    }),
  },
  {
    value: "Settings",
    icon: "settings",
    to: "/settings",
    LinkComponent: withRouter(({ staticContext, ...props }) => {
      return <NavLink {...props} />;
    }),
  },
];

class SiteWrapper extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      currentAccount: null,
    };
  }

  componentDidMount() {
    this.provider
      .request({ method: "eth_accounts" })
      .then(this.handleAccountsChanged.bind(this))
      .catch((err) => {
        console.error(err);
      });
    this.provider.on("accountsChanged", this.handleAccountsChanged.bind(this));
  }

  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      Misc.showAccountNotConnectedNotification(store);
    } else {
      this.setState({
        currentAccount: this.web3.utils.toChecksumAddress(accounts[0]),
      });
    }
  }

  connect() {
    this.provider
      .request({ method: "eth_requestAccounts" })
      .then(this.handleAccountsChanged.bind(this))
      .catch((err) => {
        console.error(err);
      });
  }

  render(): React.Node {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          const { provider, web3 } = connectionContext;
          this.provider = provider;
          this.web3 = web3;
          return (
            <Site.Wrapper
              headerProps={{
                href: "/",
                alt: "Fraunhofer FIT",
                imageURL: "/fit.svg",
                navItems: (
                  <div>
                    {this.state.currentAccount && (
                      <React.Fragment>
                        <span className="ml-2 d-none d-lg-block">
                          <span className="text-default">
                            <AddressResolver
                              emptyString={"Unregistered Address"}
                              address={this.state.currentAccount}
                            />
                          </span>
                          <small className="text-muted d-block mt-1">
                            {this.state.currentAccount}
                          </small>
                        </span>
                      </React.Fragment>
                    )}
                    {!this.state.currentAccount && (
                      <Nav.Item type="div" className="d-none d-md-flex">
                        <Button
                          size="sm"
                          color="primary"
                          onClick={this.connect.bind(this)}
                        >
                          Connect
                        </Button>
                      </Nav.Item>
                    )}
                  </div>
                ),
              }}
              navProps={{ itemsObjects: navBarItems }}
              footerProps={{
                copyright: <React.Fragment></React.Fragment>,
                nav: (
                  <React.Fragment>
                    <Grid.Col auto={true}>
                      <List className="list-inline list-inline-dots mb-0">
                        <List.Item className="list-inline-item">
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://github.com/ghanem-mhd/master-thesis-implementation/blob/master/README.md"
                          >
                            Documentation
                          </a>
                        </List.Item>
                      </List>
                    </Grid.Col>
                    <Grid.Col auto={true}>
                      <Button
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://github.com/ghanem-mhd/master-thesis-implementation"
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
              }}
            >
              {this.props.children}
            </Site.Wrapper>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default SiteWrapper;
