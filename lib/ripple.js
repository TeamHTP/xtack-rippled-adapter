const RippleAPI = require('ripple-lib').RippleAPI;

// actual server: wss://s1.ripple.com

exports.getWalletTransactions = async (address, start) => {
  if (start.length == 0) {
    start = undefined;
  }
  const api = new RippleAPI({
    server: 'wss://s.altnet.rippletest.net:51233'
  });
  try {
    api.on('error', (errorCode, errorMessage) => {
      console.log('[RIPPLE] error' + errorCode + ': ' + errorMessage);
    });
    api.on('connected', () => {
      console.log('[RIPPLE] connected');
    });
    api.on('disconnected', (code) => {
      // code - [close code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent) sent by the server
      // will be 1000 if this was normal closure
      console.log('[RIPPLE] disconnected, code:', code);
    });

    await api.connect();
    // const address = 'rwUC1MW3ZTQywJqUxBjbZXLB4iWbGvKZgk';

    const serverInfo = await api.getServerInfo();
    const ledgers = serverInfo.completeLedgers.split('-');
    let minLedgerVersion = Number(ledgers[0]);
    let maxLedgerVersion = Number(ledgers[1]);

    if (typeof start !== 'undefined') {
      minLedgerVersion = undefined;
      maxLedgerVersion = undefined;
    }

    const transactions = await api.getTransactions(address, {
      minLedgerVersion,
      maxLedgerVersion,
      start,
      initiated: false,
      excludeFailures: true,
      types: [ 'payment' ]
    });
    let response = [];
    for (transaction in transactions) {
      transaction = transactions[transaction];
      if (transaction.outcome.deliveredAmount.currency == 'XRP') {
        let responseTransaction = {};
        responseTransaction.id = transaction.id;
        responseTransaction.tag = transaction.specification.destination.tag;
        responseTransaction.drops = transaction.outcome.deliveredAmount.value * 1000000;
        responseTransaction.timestamp = transaction.outcome.timestamp;
        response.push(responseTransaction);
      }
    }
    console.info('[RIPPLE] transactions', response);

    await api.disconnect();
    return response;
  } catch (e) {
    console.error('[RIPPLE] error', e);
    api.disconnect();
  }
};
