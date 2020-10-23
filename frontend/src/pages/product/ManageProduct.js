// @flow

import * as React from "react";

import {
  Page
} from "tabler-react";

import SiteWrapper from "../SiteWrapper.react";
import CreateProduct from "./CreateProduct.js";
import AuthorizeManufacturer from "./AuthorizeManufacturer";

class ManageProduct extends React.Component {

    render () {
        return (
            <SiteWrapper>
                <Page.Content title="Manage Products">
                    <CreateProduct drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} />
                    <AuthorizeManufacturer drizzle={this.props.drizzle} drizzleState={this.props.drizzleState}/>
                </Page.Content>

            </SiteWrapper>
        )
    }
}

export default ManageProduct;
