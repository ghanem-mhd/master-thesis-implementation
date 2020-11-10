import React from "react";
import { Link } from "react-router-dom";
import { StampCard } from "tabler-react";

function getStateElement(state) {
  let className = "";
  let stateLabel = "";
  if (state === -1) {
    className = "status-icon bg-danger";
    stateLabel = "Discontented";
  }
  if (state === 0) {
    className = "status-icon bg-warning";
    stateLabel = "Idle";
  }
  if (state === 1) {
    className = "status-icon bg-success";
    stateLabel = "Active";
  }
  return (
    <div>
      <span className={className} />
      {" " + stateLabel}
    </div>
  );
}

class MachineState extends React.Component {
  constructor(props) {
    super(props);
    this.state = { machineState: 0 };
  }
  componentDidMount() {
    this.props.contract.events.TaskStarted(
      { fromBlock: "latest" },
      (error, event) => {
        console.log(event);
        if (error) {
          this.setState({ machineState: -1 });
        } else {
          this.setState({ machineState: 1 });
        }
      }
    );
    this.props.contract.events.TaskFinished(
      { fromBlock: "latest" },
      (error, event) => {
        console.log(event);
        if (error) {
          this.setState({ machineState: -1 });
        } else {
          this.setState({ machineState: 0 });
        }
      }
    );
  }

  render() {
    return (
      <StampCard
        icon="activity"
        color="blue"
        header={
          <Link to={"/machine/" + this.props.machine}>
            <small>{this.props.machine + " Machine Status"}</small>
          </Link>
        }
        footer={getStateElement(this.state.machineState)}
      ></StampCard>
    );
  }
}

export default MachineState;
