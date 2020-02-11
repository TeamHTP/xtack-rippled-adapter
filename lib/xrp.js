const { XpringClient, Wallet, Utils } = require('xpring-js');
const { Encode, Decode} = require('xrpl-tagged-address-codec');

const GRPC_URL = process.env.GRPC_URL || 'grpc.xpring.tech:80';

function conformWalletAddress(walletAddress) {
  addresses = {};
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
  addresses.balance = await xpringClient.getBalance(walletAddress);
  return addresses;
};

exports.getAddresses = (walletAddress) => {
  return conformWalletAddress(walletAddress);
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

exports.send = async (amount, destinationAddress, senderWallet) => {
  walletAddress = conformWalletAddress(walletAddress).x;
  const xpringClient = new XpringClient(GRPC_URL);
  const transactionHash = await xpringClient.send(amount, destinationAddress, senderWallet);
  return transactionHash;
};
