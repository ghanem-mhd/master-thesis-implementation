// @flow

import * as React from "react";

import {
  Page
} from "tabler-react";

import CreateProduct from "./CreateProduct.js";
import AuthorizeManufacturer from "./AuthorizeManufacturer";
import SaveProductInfo from "./SaveProductInfo";
import ConnectionContext from '../utilities/ConnectionContext';

class ManageProduct extends React.Component {

    componentDidMount() {
        document.title = "Manage Products";
    }

    render () {
        return (
            <ConnectionContext.Consumer>
                {(connectionContext) => {
                const { web3, contracts } = connectionContext;
                return (
                    <Page.Content title="Manage Products">
                        <CreateProduct contracts={contracts} web3={web3} />
                        <AuthorizeManufacturer contracts={contracts} web3={web3}/>
                        <SaveProductInfo contracts={contracts} web3={web3}/>
                    </Page.Content>
                    )
                }}
            </ConnectionContext.Consumer>
        )
    }
}

export default ManageProduct;
