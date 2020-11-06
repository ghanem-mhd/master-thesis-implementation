// @flow

import * as React from "react";

import { Grid, Card, Button } from "tabler-react";

import AddressInput from "../utilities/AddressInput";
import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";

class CreateProduct extends React.Component {
  addressInputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      createDisabled: true,
    };
  }

  resetInput() {
    this.addressInputRef.current.resetInput();
    this.setState({ createDisabled: true });
  }

  onCreateButtonClicked(e) {
    const AddressInput = this.addressInputRef.current;
    var productDID = AddressInput.state.addressInputState.value;
    Misc.getCurrentAccount(this.props.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        this.props.contracts["Product"].methods["createProduct"](productDID)
          .send({
            from: account,
            gas: process.env.REACT_APP_DEFAULT_GAS,
            gasPrice: process.env.REACT_APP_GAS_PRICE,
          })
          .on("transactionHash", (hash) => {
            Misc.showTransactionHashMessage(store, hash);
            this.resetInput();
          })
          .on("confirmation", (confirmationNumber, receipt) => {
            console.log(confirmationNumber);
            if (
              confirmationNumber === process.env.REACT_APP_CONFIRMATION_COUNT
            ) {
              Misc.showTransactionConfirmed(store, receipt);
            }
          })
          .on("error", (error) => {
            console.log(error);
            Misc.showErrorMessage(store, error.message);
          });
      }
    });
  }

  onAddressValidityChanged(valid) {
    this.setState({ createDisabled: !valid });
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col md={12} xl={12}>
          <Card title="Create New Product" isCollapsible>
            <Card.Body>
              <AddressInput
                label="Product DID"
                showDIDMethod={true}
                web3={this.props.web3}
                onAddressValidityChanged={this.onAddressValidityChanged.bind(
                  this
                )}
                ref={this.addressInputRef}
              />
            </Card.Body>
            <Card.Footer>
              <div align="right">
                <Button
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
    );
  }
}

export default CreateProduct;
