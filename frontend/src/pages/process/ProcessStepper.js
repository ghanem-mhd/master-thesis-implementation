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
          this.setState({ activeStep: 0 });
        }
      }
    );
    ProcessContract.events.ProcessStepStarted(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          console.log(error);
        } else {
          var step = parseInt(event.returnValues["step"]);
          step--;
          this.setState({ activeStep: step });
        }
      }
    );
    ProcessContract.events.ProcessFinished(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          console.log(error);
        } else {
          this.setState({ activeStep: this.state.steps.length });
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
              <Card.Body>
                {this.state.steps.length === 0 ? (
                  <div className="emptyListStatus">
                    {"No info about process steps."}
                  </div>
                ) : (
                  <Stepper activeStep={this.state.activeStep} alternativeLabel>
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
            )}
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default ProcessStepper;
