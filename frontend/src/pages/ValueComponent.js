import React from "react";

class ValueComponent extends React.Component {

    state = {};

    constructor(props){
        super(props);
    }

    componentDidMount(){
        console.log("componentDidMount ValueComponent")
        var machine       = this.props.machine
        var methodName    = this.props.methodName
        this.props.drizzle.contracts[machine].methods[methodName]().call().then( value => {
            this.setState({value:value});
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        console.log("UNSAFE_componentWillReceiveProps ValueComponent")
        var machine       = this.props.machine
        var methodName    = this.props.methodName
        this.props.drizzle.contracts[machine].methods[methodName]().call().then( value => {
            this.setState({value:value});
        });
    }

    shouldComponentUpdate(nextProps, nextState){
        console.log("shouldComponentUpdate ValueComponent")
        if (this.state && this.state.value != nextState.value){
            return true
        }else{
            return false
        }
    }

    render() {
        console.log("shouldComponentUpdate ValueComponent")
        var value = this.state.value;
        if (value){
            return (<div>{value}</div>)
        }else{
            return (<div></div>);
        }
    }
}

export default ValueComponent;