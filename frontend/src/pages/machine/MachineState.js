import React from "react";
import { Link } from "react-router-dom";
import { Grid, Avatar, Text, Header, Card } from "tabler-react";
import ContractsLoader from "../utilities/ContractsLoader";

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

  async componentDidMount() {
    try {
      let machineContractAddress = await this.props.registry.methods
        .resolveName(this.props.machineName)
        .call();
      this.setState({ machineContractAddress: machineContractAddress });
      let result = await ContractsLoader.loadMachineContract(
        this.props.web3,
        machineContractAddress
      );
      this.setUpListeners(result.wsContract);
    } catch (error) {
      console.log(error);
      this.setState({ machineState: -1 });
    }
  }

  async setUpListeners(MachineContract) {
    MachineContract.events.TaskStarted(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          this.setState({ machineState: -1 });
        } else {
          this.setState({ machineState: 1 });
        }
      }
    );
    MachineContract.events.TaskFinished(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          this.setState({ machineState: -1 });
        } else {
          this.setState({ machineState: 0 });
        }
      }
    );
    MachineContract.methods
      .getSymbol()
      .call()
      .then((symbol) => {
        this.setState({ symbol: symbol });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <Card>
        <Card.Body>
          <Grid.Row>
            <Grid.Col auto>
              <Avatar size="xxl" imageURL={"/" + this.state.symbol + ".jpg"} />
            </Grid.Col>
            <Grid.Col className="align-self-center">
              <Header size={4} className="m-0">
                <Link to={"/machine/" + this.state.machineContractAddress}>
                  <small>{this.props.machineName + " Status"}</small>
                </Link>
              </Header>
              <Text.Small muted>
                {getStateElement(this.state.machineState)}
              </Text.Small>
            </Grid.Col>
          </Grid.Row>
        </Card.Body>
      </Card>
    );
  }
}

export default MachineState;
