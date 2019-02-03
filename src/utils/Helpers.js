const Utils = require("elv-client-js/src/Utils");

export const FormatAddress = (addr) => {
  return Utils.FormatAddress(addr);
};

export const EqualAddress = (addr1, addr2) => {
  return FormatAddress(addr1) === FormatAddress(addr2);
};
