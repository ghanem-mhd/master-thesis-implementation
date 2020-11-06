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
    store.addNotification({
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
    store.addNotification({
      title: "Transaction has been sent",
      message: transactionHash,
      type: "info",
      insert: "top",
      container: "bottom-right",
      dismiss: {
        duration: 0,
        click: false,
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
};

module.exports = Misc;
