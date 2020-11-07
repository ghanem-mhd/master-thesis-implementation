import React from "react";

import { Grid, Card } from "tabler-react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";

class ProcessStepper extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Process Steps" isCollapsible>
            <Card.Body>
              <Stepper activeStep={this.props.activeStep} alternativeLabel>
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
