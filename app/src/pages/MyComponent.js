import React from "react";

class MyComponent extends React.PureComponent {

    state = { dataKey1: null, dataKey2:null, dataKey3:null };

    componentDidMount() {
        console.log("componentDidMount")
        let dataKey1 = this.props.drizzle.contracts["VGR"].methods["machineID"].cacheCall();
        let dataKey2 = this.props.drizzle.contracts["VGR"].methods["machineOwner"].cacheCall();
        let dataKey3 = this.props.drizzle.contracts["VGR"].methods["getTasksCount"].cacheCall();
        this.setState({ dataKey1:dataKey1, dataKey2:dataKey2, dataKey3:dataKey3});
    }

    render() {
        const { VGR } = this.props.drizzleState.contracts;
        const machineID = VGR.machineID[this.state.dataKey1];
        const machineOwner = VGR.machineOwner[this.state.dataKey2];
        const tasksCount = VGR.getTasksCount[this.state.dataKey3];
        return (
            <div>
                <p>Machine ID: {machineID && machineID.value}</p>
                <p>Machine Owner: {machineOwner && machineOwner.value}</p>
                <p>Tasks Count: {tasksCount && tasksCount.value}</p>
            </div>
        )
    }
}

export default MyComponent;