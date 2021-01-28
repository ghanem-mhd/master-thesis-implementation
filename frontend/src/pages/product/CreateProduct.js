// @flow

import * as React from "react";

import { Page, Grid, Card, Button } from "tabler-react";

import AddressInput from "../utilities/AddressInput";
import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";
import ConnectionContext from "../utilities/ConnectionContext";

class CreateProduct extends React.Component {
  addressInputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      createDisabled: true,
    };
  }

  componentDidMount() {
    document.title = "Create Product";
  }

  resetInput() {
    this.addressInputRef.current.resetInput();
    this.setState({ createDisabled: true });
  }

  onCreateButtonClicked(e) {
    const AddressInput = this.addressInputRef.current;
    var productDID = AddressInput.state.addressInputState.value;
    Misc.getCurrentAccount(this.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        this.contracts["Product"].methods["createProduct"](productDID)
          .send({
            from: account,
            gas: process.env.REACT_APP_DEFAULT_GAS,
            gasPrice: process.env.REACT_APP_GAS_PRICE,
          })
          .on("transactionHash", (hash) => {
            this.notificationID = Misc.showTransactionHashMessage(store, hash);
            this.resetInput();
          })
          .on("confirmation", (confirmationNumber, receipt) => {
            store.removeNotification(this.notificationID);
          })
          .on("error", (error) => {
            store.removeNotification(this.notificationID);
            Misc.showErrorMessage(store, error.message);
            console.log(error);
          });
      }
    });
  }

  onAddressValidityChanged(valid) {
    this.setState({ createDisabled: !valid });
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.contracts = connectionContext.contracts;
          return (
            <Page.Content>
              <Grid.Row>
                <Grid.Col md={12} xl={12}>
                  <Card title="Create New Product" isCollapsible>
                    <Card.Body>
                      <AddressInput
                        label="Product DID"
                        showDIDMethod={true}
                        web3={this.web3}
                        onAddressValidityChanged={this.onAddressValidityChanged.bind(
                          this
                        )}
                        ref={this.addressInputRef}
                      />
                    </Card.Body>
                    <Card.Footer>
                      <div align="right">
                        <Button
                          size="sm"
                          disabled={this.state.createDisabled}
                          onClick={this.onCreateButtonClicked.bind(this)}
                          color="primary"
                        >
                          Create
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Grid.Col>
              </Grid.Row>
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default CreateProduct;
