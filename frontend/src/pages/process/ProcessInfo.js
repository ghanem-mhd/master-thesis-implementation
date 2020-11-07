import React from "react";
import { Link } from "react-router-dom";

import { Table, Grid, Card, Dimmer } from "tabler-react";

class ProcessInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      info: props.staticInfo,
      loading: true,
    };
  }

  getProcessInfo() {
    var ProcessContract = this.props.contract;

    this.props.dynamicInfo.forEach((element) => {
      ProcessContract.methods[element.methodName]()
        .call()
        .then((result) => {
          var newInfo = {};
          newInfo.infoName = element.infoName;
          if (element.postfix) {
            newInfo.infoValue = result + " " + element.postfix;
          } else {
            newInfo.infoValue = result;
          }
          this.setState((state, props) => {
            return {
              info: [...this.state.info, newInfo],
            };
          });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  componentDidMount() {
    this.getProcessInfo();
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Process Info" isCollapsible>
            <Dimmer active={false} loader>
              <Card.Body>
                {this.state.info.length === 0 ? (
                  <div className="emptyListStatus">{"No Process Info."}</div>
                ) : (
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColHeader>Info Name</Table.ColHeader>
                        <Table.ColHeader>Info Value</Table.ColHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {this.state.info.map((object, i) => (
                        <Table.Row key={this.state.info[i].infoName}>
                          <Table.Col>{this.state.info[i].infoName}</Table.Col>
                          {this.state.info[i].link && (
                            <Table.Col>
                              <Link
                                to={this.state.info[i].link}
                                target="_blank"
                              >
                                {this.state.info[i].infoValue}
                              </Link>
                            </Table.Col>
                          )}
                          {!this.state.info[i].link && (
                            <Table.Col>
                              {this.state.info[i].infoValue}
                            </Table.Col>
                          )}
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )}
              </Card.Body>
            </Dimmer>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default ProcessInfo;
