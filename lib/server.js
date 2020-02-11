const restify = require('restify');
const restifyErrors = require('restify-errors');
const xrp = require('./xrp.js');
const util = require('./util.js');

const PORT = process.env.PORT || 8080;

const server = restify.createServer();
server.use((req, res, next) => {
  if (req.header('Authorization') !== 'Bearer this_is_a_test_token') {
    next(new restifyErrors.UnauthorizedError());
  }
  else {
    next();
  }
});
server.use(restify.plugins.queryParser());

server.get('/xrp/balance', async (req, res, next) => {
  const response = await xrp.getBalance(req.query.wallet);
  res.send(response);
  next();
});

server.get('/xrp/random_wallet', (req, res, next) => {
  const randomWalletResult = xrp.generateRandomWallet();
  response = {};
  response.mnemonic = util.encryptMnemonic(randomWalletResult.mnemonic);
  response.addresses = xrp.getAddresses(randomWalletResult.wallet.getAddress());
  res.send(response);
  next();
});

server.get('/xrp/wallet_address', (req, res, next) => {
  if (typeof req.query.mnemonic === 'undefined') {
    next(new restifyErrors.BadRequestError());
  }
  req.query.mnemonic = req.query.mnemonic.replace(/ /g, '+');
  const response = xrp.getWalletAddress(util.decryptMnemonic(req.query.mnemonic));
  res.send(response);
  next();
});

server.get('/xrp/send', async (req, res, next) => {
  if (typeof req.query.amount === 'undefined' || typeof req.query.destinationAddress === 'undefined' || typeof req.query.senderMnemonic === 'undefined') {
    next(new restifyErrors.BadRequestError());
  }
  req.query.senderMnemonic = req.query.senderMnemonic.replace(/ /g, '+');
  const response = await xrp.send(req.query.amount, req.query.destinationAddress, util.decryptMnemonic(req.query.senderMnemonic));
  res.send(response);
  next();
});

server.listen(PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});