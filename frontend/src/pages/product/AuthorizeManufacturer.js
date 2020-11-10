// @flow

import * as React from "react";

import { Grid, Card, Button } from "tabler-react";

import AddressInput from "../utilities/AddressInput";
import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";

class AuthorizeManufacturer extends React.Component {
  manufacturerAddressInputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      inputValidity: false,
    };
    this.initialState = this.state;
  }

  resetInputs() {
    var manufacturerAddressInput = this.manufacturerAddressInputRef.current;
    manufacturerAddressInput.resetInput();
    this.setState(this.initialState);
  }

  onAuthorizeButtonClicked(e) {
    var manufacturerAddressInput = this.manufacturerAddressInputRef.current;
    var productDID = this.props.productDID;
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
            this.notificationID = Misc.showTransactionHashMessage(store, hash);
            this.resetInputs();
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

  onManufacturerAddressValidityChanged(valid) {
    this.setState({ inputValidity: valid });
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Authorize Manufacturer" isCollapsible>
            <Card.Body>
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
                  disabled={!this.state.inputValidity}
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
