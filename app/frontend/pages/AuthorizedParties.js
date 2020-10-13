import React from "react";
import {
  Table,
  Grid,
  Card
} from "tabler-react";

class AuthorizedParties extends React.PureComponent {

    state = {};

    constructor(props){
        super(props);
    }

    getData(props){
        props.drizzle.contracts[props.machine].methods[props.methodName].call().call().then( list => {
            this.setState({list:list})

        });
    }

    componentDidMount(){
        this.getData(this.props)
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        this.getData(nextProps)
    }

    getProcessName(address){
        var map = {
            "0x5863A73a7a9F4E2073274c382beA733585758a60": "Production Process",
            "0xB7C78b5d4300749f9754433bd987C1750cCD1cA4": "Supplying Process"
        }
        if (map[address]){
            return map[address]
        }else{
            return "n.a."
        }
    }

    render() {
        console.log(this.props.drizzle.contracts)
        var list =  this.state.list;
        return (
            <Grid.Row>
                <Grid.Col md={12} xl={12}>
                    <Card
                    title={"Authorized " + this.props.name}
                    isCollapsible
                    isClosable
                    body={
                        list && <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColHeader>Process Name</Table.ColHeader>
                                    <Table.ColHeader>Contract Address</Table.ColHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                            {
                                list.map((object, i) =>
                                    <Table.Row key={list[i]}>
                                        <Table.Col>{this.getProcessName(list[i])}</Table.Col>
                                         <Table.Col>{list[i]}</Table.Col>
                                    </Table.Row>
                                )
                            }
                            </Table.Body>
                        </Table>
                    }
                    />
                </Grid.Col>
            </Grid.Row>
        )
    }
}

export default AuthorizedParties;