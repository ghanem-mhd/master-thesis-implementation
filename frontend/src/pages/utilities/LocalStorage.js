const LocalStorage = {
  getItemFromLocalStorage: function (keyName, defaultValue) {
    let storedValue = localStorage.getItem(keyName);
    if (storedValue === null) {
      return defaultValue;
    } else {
      return storedValue;
    }
  },
};

module.exports = LocalStorage;
