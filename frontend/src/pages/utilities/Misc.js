const Misc = {
  toHex: function (web3, string) {
    return web3.utils.padRight(web3.utils.asciiToHex(string), 64);
  },
  toString: function (web3, hex) {
    return web3.utils.hexToString(hex);
  },
  getCurrentAccount: function (web3, callback) {
    web3.eth.getAccounts((error, accounts) => {
      if (error || accounts === null || accounts.length === 0) {
        console.log(error);
        callback("Can't find account.", null);
      } else {
        console.log("Used account " + accounts);
        callback(null, accounts[0].toString());
      }
    });
  },
  showErrorMessage: function (store, message) {
    return store.addNotification({
      title: "Error",
      message: message,
      type: "danger",
      insert: "top",
      container: "bottom-right",
      dismiss: {
        duration: 0,
        click: false,
        showIcon: true,
      },
    });
  },
  showTransactionHashMessage: function (store, transactionHash) {
    return store.addNotification({
      title: "Transaction is being mined",
      message: transactionHash,
      type: "info",
      container: "bottom-right",
      dismiss: {
        duration: parseInt(
          process.env.REACT_APP_TRANSACTION_NOTIFICATION_TIMEOUT
        ),
        click: false,
        onScreen: true,
        showIcon: true,
      },
    });
  },
  showTransactionConfirmed: function (store, transactionHash) {
    store.addNotification({
      title: "Transaction has been confirmed",
      message: transactionHash,
      type: "success",
      insert: "top",
      container: "bottom-right",
      dismiss: {
        duration: 0,
        click: false,
        showIcon: true,
      },
    });
  },
  showAccountNotConnectedNotification(store) {
    store.addNotification({
      title: "Warning",
      message: "Metamask account not connected.",
      type: "warning",
      insert: "top",
      container: "bottom-right",
      dismiss: {
        duration: 5000,
        click: false,
        showIcon: true,
        onScreen: true,
      },
    });
  },
  formatTimestamp: function (timestamp) {
    if (timestamp.toString() === "0") {
      return "n.a";
    } else {
      return new Date(timestamp.toString() * 1000).toLocaleString();
    }
  },
  getAccountName(account) {
    let mapping = {
      "0xed9d02e382b34818e88b88a309c7fe71e65f419d": "Admin",
      "0x8A765573d859c4b7d3764B943ba0F69dB5019BbC": "Maintainer",
      "0x5F97Cbad3783F7c4c93808F0167a24f61c40e549": "Manufacturer",
      "0x8EFbbBC49A970D4BeA13F0Bd16E62F79168FD68d": "Machine Owner",
      "0x588CF9C29562A9ED033961346dDf57a6AdeB9202": "Product Owner",
    };
    if (account in mapping) {
      return mapping[account];
    } else {
      return "Unknown Account";
    }
  },
  getSupplyingSteps() {
    return [
      { taskName: "Get Info Task", machineName: "VGR" },
      { taskName: "Fetch Container Task", machineName: "HBW" },
      { taskName: "Drop to Container Task", machineName: "VGR" },
      { taskName: "Store Container Task", machineName: "HBW" },
    ];
  },
  getProductionSteps() {
    return [
      { taskName: "Fetch Product", machineName: "HBW" },
      { taskName: "Move Product", machineName: "VGR" },
      { taskName: "Process Product", machineName: "MPO" },
      { taskName: "Sort Product", machineName: "SLD" },
      { taskName: "Deliver Product", machineName: "VGR" },
    ];
  },
  getMachines() {
    return {
      VGR: "Vacuum Gripper Robot",
      HBW: "High-Bay Warehouse",
      MPO: "Multi-Processing Station with Oven",
      SLD: "Sorting Line with Color Detection",
    };
  },
};

module.exports = Misc;
