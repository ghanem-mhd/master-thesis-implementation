// @flow

import * as React from "react";

import { Grid, Card, Button } from "tabler-react";

import InfoInput from "../utilities/InfoInput";
import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";

class SaveMachineInfo extends React.Component {
  infoInputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      inputValidity: {
        info: false,
      },
    };
    this.initialState = this.state;
  }

  resetInputs() {
    this.infoInputRef.current.resetInput();
    this.setState(this.initialState);
  }

  onSaveButtonClicked(e) {
    var MachineContract = this.props.contracts[this.props.machine];

    var infoInput = this.infoInputRef.current;
    var infoName = Misc.toHex(
      this.props.web3,
      infoInput.state.inputValues.infoName
    );
    var infoValue = Misc.toHex(
      this.props.web3,
      infoInput.state.inputValues.infoValue
    );
    Misc.getCurrentAccount(this.props.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        MachineContract.methods["saveMachineInfo"](infoName, infoValue)
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

  onInfoValidityChanged(valid) {
    var inputValidity = {};
    inputValidity.info = valid;
    this.setState({ inputValidity });
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Save Machine Info" isCollapsible>
            <Card.Body>
              <InfoInput
                onInfoValidityChanged={this.onInfoValidityChanged.bind(this)}
                ref={this.infoInputRef}
              />
            </Card.Body>
            <Card.Footer>
              <div align="right">
                <Button
                  disabled={!this.state.inputValidity.info}
                  onClick={this.onSaveButtonClicked.bind(this)}
                  color="primary"
                >
                  Save
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default SaveMachineInfo;
