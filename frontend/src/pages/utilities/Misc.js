const Misc = {
  getProducts: function () {
    return [
      "0x1EbFbf2Ffb7b2218eB974Cc885Ad4A165A310283",
      "0x6125C20d75Bd7b25032B2cbF5e5244A1b640241C",
      "0x2964ed17E1B236e61F3D837C9cC03D462bC2c300",
      "0xD9E6BAcA6A9a4852A8b8f3AcEfB8CaF5D222b8C0",
      "0xb2C056785E3d3892ddA5d1C28988789Ef3d84DC2",
      "0x3e3A546E7315b28be7b722b8Fecc4f36BD7A16Ed",
      "0xa985ebAD0E7FA5FD90d507c417fC48396AB16187",
      "0x7e9956FFFFd8C4a494007236a35DDee27B245BfC",
      "0xFB77D1efFf654bAd54b289cc7143210a603D70eb",
    ];
  },
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
      container: "bottom-full",
      dismiss: {
        duration: 0,
        click: false,
        showIcon: true,
      },
    });
  },
  showTransactionHashMessage: function (store, transactionHash) {
    return store.addNotification({
      title: "Waiting for transaction to be confirmed...",
      container: "bottom-full",
      message: "Transaction Hash: " + transactionHash,
      type: "default",
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
      message: "Transaction hash: " + transactionHash,
      type: "success",
      container: "bottom-full",
      dismiss: {
        duration: 5000,
        click: true,
        showIcon: true,
      },
    });
  },
  showAccountNotConnectedNotification(store) {
    store.addNotification({
      title: "Error",
      message: "Metamask is not connected.",
      type: "warning",
      insert: "top",
      container: "bottom-full",
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
  getAvailableProductDIDs(DIDsInStock) {
    var availableDIDs = module.exports
      .getProducts()
      .filter((x) => !DIDsInStock.includes(x));
    return availableDIDs;
  },
};

module.exports = Misc;
