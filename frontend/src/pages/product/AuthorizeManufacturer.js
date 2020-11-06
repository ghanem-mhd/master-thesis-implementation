// @flow

import * as React from "react";

import { Grid, Card, Button } from "tabler-react";

import AddressInput from "../utilities/AddressInput";
import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";

class AuthorizeManufacturer extends React.Component {
  productDIDInputRef = React.createRef();
  manufacturerAddressInputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      inputValidity: {
        productDID: false,
        manufacturerAddress: false,
      },
    };
    this.initialState = this.state;
  }

  resetInputs() {
    var productDIDInput = this.productDIDInputRef.current;
    var manufacturerAddressInput = this.manufacturerAddressInputRef.current;
    productDIDInput.resetInput();
    manufacturerAddressInput.resetInput();
    this.setState(this.initialState);
  }

  onAuthorizeButtonClicked(e) {
    var productDIDInput = this.productDIDInputRef.current;
    var manufacturerAddressInput = this.manufacturerAddressInputRef.current;
    var productDID = productDIDInput.state.addressInputState.value;
    var manufacturerAddress =
      manufacturerAddressInput.state.addressInputState.value;

    Misc.getCurrentAccount(this.props.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        this.props.contracts["Product"].methods["authorizeManufacturer"](
          manufacturerAddress,
          productDID
        )
          .send({
            from: account,
            gas: process.env.REACT_APP_DEFAULT_GAS,
            gasPrice: process.env.REACT_APP_GAS_PRICE,
          })
          .on("transactionHash", (hash) => {
            Misc.showTransactionHashMessage(store, hash);
            this.resetInputs();
          })
          .on("confirmation", (confirmationNumber, receipt) => {
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

  onProductDIDValidityChanged(valid) {
    var inputValidity = {};
    inputValidity.productDID = valid;
    inputValidity.manufacturerAddress = this.state.inputValidity.manufacturerAddress;
    this.setState({ inputValidity });
  }

  onManufacturerAddressValidityChanged(valid) {
    var inputValidity = {};
    inputValidity.manufacturerAddress = valid;
    inputValidity.productDID = this.state.inputValidity.productDID;
    this.setState({ inputValidity });
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Authorize Manufacturer" isCollapsible>
            <Card.Body>
              <AddressInput
                label="Product DID"
                showDIDMethod={true}
                web3={this.props.web3}
                onAddressValidityChanged={this.onProductDIDValidityChanged.bind(
                  this
                )}
                ref={this.productDIDInputRef}
              />
              <AddressInput
                label="Manufacturer Address"
                showDIDMethod={false}
                web3={this.props.web3}
                onAddressValidityChanged={this.onManufacturerAddressValidityChanged.bind(
                  this
                )}
                ref={this.manufacturerAddressInputRef}
              />
            </Card.Body>
            <Card.Footer>
              <div align="right">
                <Button
                  disabled={
                    !this.state.inputValidity.productDID ||
                    !this.state.inputValidity.manufacturerAddress
                  }
                  onClick={this.onAuthorizeButtonClicked.bind(this)}
                  color="primary"
                >
                  Authorize
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default AuthorizeManufacturer;
