import React from "react";

import { Grid, Card } from "tabler-react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import ContractsLoader from "../utilities/ContractsLoader";

class ProcessStepper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processInstanceID: "N/A",
      productDID: "N/A",
      steps: [],
      activeStep: -1,
      fatalError: null,
    };
  }

  async getStepsInfo(ProcessContract, numberOfSteps) {
    let steps = [];
    try {
      for (let index = 1; index <= numberOfSteps; index++) {
        var result = await ProcessContract.methods.getStepInfo(index).call();
        let step = {};
        step.machineName = result[0];
        step.taskName = result[1];
        steps.push(step);
      }
      this.setState({ steps: steps });
    } catch (error) {
      console.log(error);
    }
  }

  async componentDidMount() {
    try {
      if (this.props.contract) {
        this.setUpListeners(this.props.contract);
        return;
      }
      if (this.props.processName) {
        let processContractAddress = await this.props.registry.methods
          .resolveName(this.props.processName)
          .call();
        let contract = await ContractsLoader.loadProcessContract(
          this.props.web3,
          processContractAddress
        );
        this.setUpListeners(contract.wsContract);
      }
    } catch (error) {
      console.log(error);
      this.setState({ fatalError: error.message });
    }
  }

  setUpListeners(ProcessContract) {
    ProcessContract.methods
      .getNumberOfSteps()
      .call()
      .then((numberOfSteps) => {
        this.getStepsInfo(ProcessContract, numberOfSteps);
      })
      .catch((error) => {
        console.log(error);
        this.setState({ fatalError: error.message });
      });

    ProcessContract.events.ProcessStarted(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          console.log(error);
        } else {
          var processInstanceID = event.returnValues["processID"];
          var productDID = event.returnValues["productDID"];
          this.setState({
            activeStep: 0,
            processInstanceID: processInstanceID,
            productDID: "did:ethr:" + productDID,
          });
        }
      }
    );
    ProcessContract.events.ProcessStepStarted(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          console.log(error);
        } else {
          var processInstanceID = event.returnValues["processID"];
          var productDID = event.returnValues["productDID"];
          var step = parseInt(event.returnValues["step"]);
          step--;
          this.setState({
            activeStep: step,
            processInstanceID: processInstanceID,
            productDID: "did:ethr:" + productDID,
          });
        }
      }
    );
    ProcessContract.events.ProcessFinished(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          console.log(error);
        } else {
          var processInstanceID = event.returnValues["processID"];
          var productDID = event.returnValues["productDID"];
          this.setState({
            activeStep: this.state.steps.length,
            processInstanceID: processInstanceID,
            productDID: "did:ethr:" + productDID,
          });
          setTimeout(() => {
            this.setState({
              activeStep: -1,
              processInstanceID: "N/A",
              productDID: "N/A",
            });
          }, 3000);
        }
      }
    );
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card
            title={this.props.processName + " Execution"}
            isCollapsible
            isFullscreenable
          >
            {this.state.fatalError !== null ? (
              <Card.Body>
                <div className="emptyListStatus">{this.state.fatalError}</div>
              </Card.Body>
            ) : (
              <React.Fragment>
                <Card.Body>
                  {this.state.steps.length === 0 ? (
                    <div className="emptyListStatus">
                      {"No info about process steps."}
                    </div>
                  ) : (
                    <Stepper
                      activeStep={this.state.activeStep}
                      alternativeLabel
                    >
                      {this.state.steps.map((step, index) => {
                        return (
                          <Step key={step.taskName}>
                            <StepLabel>
                              {step.taskName}
                              <br />
                              {step.machineName}
                            </StepLabel>
                          </Step>
                        );
                      })}
                    </Stepper>
                  )}
                </Card.Body>
                <Card.Footer>
                  <Grid.Row>
                    <Grid.Col sm={6}>
                      <b>Product DID: </b>
                      {this.state.productDID}
                    </Grid.Col>
                    <Grid.Col sm={6}>
                      <b>Process ID: </b>
                      {this.state.processInstanceID}
                    </Grid.Col>
                  </Grid.Row>
                </Card.Footer>
              </React.Fragment>
            )}
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default ProcessStepper;
