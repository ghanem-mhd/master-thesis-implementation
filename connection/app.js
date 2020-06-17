var contract = require("@truffle/contract");


module.exports = {
    start: function(callback) {
      var self = this;
  
      self.web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
          console.log("There was an error fetching your accounts.");
          return;
        }
  
        if (accs.length == 0) {
          console.log("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
          return;
        }
        self.accounts = accs;
        self.account = self.accounts[0];
  
        callback(self.accounts);
      });
    }
}