import * as React from "react";
import { Link } from "react-router-dom";

function DIDLink(props) {
  return (
    <Link to={"/did-resolver/" + props.DID} target="_blank">
      {"did:ethr:" + props.DID}
    </Link>
  );
}

export default DIDLink;
