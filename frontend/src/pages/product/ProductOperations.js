import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  Grid,
  Card,
  Button
} from "tabler-react";

import Misc from '../utilities/Misc';

class ProductOperations extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        operations: []
      }
    }

    getOperations(productDID){
        if (typeof productDID === 'undefined'){return;}
        var ProductContract = this.props.contracts["Product"];
        ProductContract.methods["getProductOperations"](productDID).call().then( operationsIDsList => {
            if (operationsIDsList.length > 0){
                for (const operationID of operationsIDsList){
                    ProductContract.methods["getProductOperation"](operationID).call().then( operationResult => {
                        var operation = this.parseOperationObject(operationResult);
                        operation.ID = operationID;
                        this.setState( (state, props) => {
                            return {
                                operations: [...this.state.operations, operation]
                            };
                        });
                    }).catch( error => {
                        console.log(error);
                    });
                }
            }
        }).catch( error => {
            console.log(error);
        });
    }

    parseOperationObject(operationResult){
        var operation       = {};
        operation.machine   = operationResult[0];
        operation.taskID    = operationResult[1];
        operation.time      = Misc.formatTimestamp(operationResult[2]);
        operation.name      = operationResult[3];
        operation.result    = operationResult[4];
        return operation;
    }

    componentDidMount(){
        this.getOperations(this.props.productDID)
    }

    render() {
        return (
            <Grid.Row>
                <Grid.Col>
                    <Card title="Product Operations" isCollapsible isFullscreenable>
                        <Card.Body>
                            {this.state.operations.length !== 0
                            ? <Table className="table-vcenter text-left">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColHeader alignContent="center">ID</Table.ColHeader>
                                        <Table.ColHeader alignContent="center">Operation</Table.ColHeader>
                                        <Table.ColHeader>Result</Table.ColHeader>
                                        <Table.ColHeader alignContent="center">Time</Table.ColHeader>
                                        <Table.ColHeader alignContent="center">Machine ID</Table.ColHeader>
                                        <Table.ColHeader alignContent="center">Task ID</Table.ColHeader>
                                        <Table.ColHeader></Table.ColHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                {
                                    this.state.operations.map((object, i) =>
                                        <Table.Row key={this.state.operations.ID}>
                                            <Table.Col alignContent="center" className="table-center">{this.state.operations[i].ID}</Table.Col>
                                            <Table.Col alignContent="center" className="table-center">{this.state.operations[i].name}</Table.Col>
                                            <Table.Col>{this.state.operations[i].result}</Table.Col>
                                            <Table.Col alignContent="center">{this.state.operations[i].time}</Table.Col>
                                            <Table.Col alignContent="center">{this.state.operations[i].machine}</Table.Col>
                                            <Table.Col alignContent="center">{this.state.operations[i].taskID}</Table.Col>
                                            <Table.Col>
                                                <Link target="/" to={"/operation-vc-resolver/" + this.state.operations[i].ID}>
                                                    <Button size="sm" color="success">V.Credential</Button>
                                                </Link>
                                            </Table.Col>
                                        </Table.Row>
                                    )
                                }
                                </Table.Body>
                            </Table>
                            :<div className="emptyListStatus">{"No Product Operations."}</div>
                            }
                        </Card.Body>
                    </Card>
                </Grid.Col>
            </Grid.Row>
        )
    }
}

export default ProductOperations;