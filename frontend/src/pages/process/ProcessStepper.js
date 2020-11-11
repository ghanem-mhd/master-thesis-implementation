import React from "react";

import { Grid, Card } from "tabler-react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";

class ProcessStepper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: -1,
    };
  }
  componentDidMount() {
    this.props.contract.events.ProcessStarted(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          console.log(error);
        } else {
          this.setState({ activeStep: 0 });
        }
      }
    );
    this.props.contract.events.ProcessStepStarted(
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
    this.props.contract.events.ProcessFinished(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          console.log(error);
        } else {
          this.setState({ activeStep: this.props.steps.length });
        }
      }
    );
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title={this.props.title} isCollapsible>
            <Card.Body>
              <Stepper activeStep={this.state.activeStep} alternativeLabel>
                {this.props.steps.map((step, index) => {
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
            </Card.Body>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default ProcessStepper;
