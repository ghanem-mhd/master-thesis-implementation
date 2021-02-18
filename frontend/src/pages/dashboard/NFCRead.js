// @flow

import * as React from "react";
import { Card, Button, Dimmer } from "tabler-react";
import ProductDIDResolver from "../product/ProductDIDResolver";

const NFC_READ_URL = process.env.REACT_APP_BACKEND_BASE_URL + "nfc-read/";
const NFC_DELETE_URL = process.env.REACT_APP_BACKEND_BASE_URL + "nfc-delete/";

class NFCRead extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      productNFCId: "N/A",
    };
    this.initialState = this.state;
  }

  componentDidMount() {
    this.props.socket.on("f/i/nfc/ds", (m) => {
      var message = JSON.parse(JSON.stringify(m));
      if (message && message.workpiece && message.workpiece.id) {
        console.log(message.workpiece.id);
        this.getProductDID(message.workpiece.id);
      }
    });
  }

  async getProductDID(productNFCId) {
    try {
      var productDID = await this.props.productContract.methods
        .getProductFromPhysicalID(productNFCId)
        .call();
      console.log(productDID);
      if (
        productDID.toString() === "0x0000000000000000000000000000000000000000"
      ) {
        this.setState({
          loading: false,
          error: "Can not find a product for this NFC ID",
          productNFCId: productNFCId,
        });
      } else {
        this.setState({
          loading: false,
          productDID: productDID,
          productNFCId: productNFCId,
        });
      }
    } catch (error) {
      console.log(error);
      this.setState({
        loading: false,
        error: error.toString(),
        productNFCId: productNFCId,
      });
    }
  }

  onReadClicked() {
    this.setState({ loading: true, error: null, productDID: null });
    fetch(NFC_READ_URL);
  }

  onDeleteClicked() {
    this.setState({ loading: false, error: null, productDID: null });
    fetch(NFC_DELETE_URL);
  }

  getBody() {
    if (this.state.productDID) {
      return (
        <div className="emptyListStatus">
          <ProductDIDResolver productDID={this.state.productDID} />
        </div>
      );
    }
    if (this.state.error) {
      return <div className="emptyListStatus">{this.state.error}</div>;
    }
    return (
      <div className="emptyListStatus">
        {"First place the product on the NFC reader"}
      </div>
    );
  }

  render() {
    return (
      <Card title="NFC Reader" isFullscreenable isClosable isCollapsible>
        <Dimmer active={this.state.loading} loader>
          <Card.Body>{this.getBody()}</Card.Body>
        </Dimmer>
        <Card.Footer>
          <div style={{ float: "left" }}>
            <b>Last NFC ID:</b>
            {this.state.productNFCId}
          </div>
          <div style={{ float: "right" }}>
            {false && (
              <Button
                size="sm"
                color="primary"
                className="mr-4"
                onClick={this.onDeleteClicked.bind(this)}
              >
                NFC delete
              </Button>
            )}
            <Button
              color="primary"
              size="sm"
              onClick={this.onReadClicked.bind(this)}
            >
              NFC read
            </Button>
          </div>
        </Card.Footer>
      </Card>
    );
  }
}

export default NFCRead;
