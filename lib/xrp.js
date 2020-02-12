const { XpringClient, Wallet, Utils } = require('xpring-js');
const { Encode, Decode} = require('xrpl-tagged-address-codec');

const GRPC_URL = process.env.GRPC_URL || 'grpc.xpring.tech:80';

function conformWalletAddress(walletAddress) {
  let addresses = {};
  if (Utils.isValidClassicAddress(walletAddress)) {
    addresses.r = walletAddress;
    addresses.x = Encode({ account: walletAddress });
  }
  else if (Utils.isValidXAddress(walletAddress)) {
    addresses.x = walletAddress;
    addresses.r = Decode(walletAddress).account;
  }
  return addresses;
}

exports.getBalance = async (walletAddress) => {
  walletAddress = conformWalletAddress(walletAddress).x;
  const xpringClient = new XpringClient(GRPC_URL);
  let balance = 0;
  try {
    balance = Number(await xpringClient.getBalance(walletAddress));
  }
  catch (e) { }
  return { balance };
};

exports.getAddresses = (walletAddress) => {
  return conformWalletAddress(walletAddress);
};

exports.getAddressesFromClassicWithTag = (classicAddress, tag) => {
  let addresses = {};
  if (Utils.isValidClassicAddress(classicAddress)) {
    addresses.r = `${classicAddress}:${tag}`;
    addresses.x = Encode({ account: classicAddress, tag });
  }
  return addresses;
};

exports.generateRandomWallet = () => {
  return Wallet.generateRandomWallet();
};

exports.getWalletAddress = (mnemonic) => {
  const wallet = Wallet.generateWalletFromMnemonic(mnemonic);
  const response = {
    addresses: conformWalletAddress(wallet.getAddress())
  };
  return response;
};

exports.send = async (amount, destinationAddress, senderWalletMnemonic) => {
  const senderWallet = Wallet.generateWalletFromMnemonic(senderWalletMnemonic);
  destinationAddress = conformWalletAddress(destinationAddress).x;
  const xpringClient = new XpringClient(GRPC_URL);
  const transactionHash = await xpringClient.send(amount, destinationAddress, senderWallet);
  return transactionHash;
};
