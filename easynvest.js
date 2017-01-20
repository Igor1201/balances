'use strict';
const nconf = require('nconf');
const rp = require('request-promise');

nconf.env('_').file({file: process.env.HOME + '/.balances.conf'});

const authorize = () => {
  const options = {
    method: 'POST',
    uri: 'https://auth.app.easynvest.com.br/v1/users/me/tokens',
    headers: {'Content-type': 'application/json'},
    body: {
      login: nconf.get('easynvest:login'),
      password: nconf.get('easynvest:password')
    },
    json: true,
    resolveWithFullResponse: true
  };

  return rp(options)
    .then(response => {
      nconf.set('easynvest:auth:token', response.body.token);
      nconf.save();
    })
    .catch(console.error);
}

const checkLogin = () => {
  const options = {
    method: 'GET',
    uri: 'https://api.app.easynvest.com.br/v2/users/me/accounts/PRIVATE',
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Bearer ' + nconf.get('easynvest:auth:token')
    },
    json: true,
    resolveWithFullResponse: true
  };

  return rp(options).then(response => {
    if (response.statusCode != 200)
      throw new Error('Login failed');
  });
}

const genericBalance = (type) => {
  return rp({
    method: 'GET',
    uri: `https://api.app.easynvest.com.br/v2/users/me/accounts/${type}`,
    headers: {
      'Authorization': 'Bearer ' + nconf.get('easynvest:auth:token')
    },
    json: true,
    resolveWithFullResponse: true
  })
  .then(response => response.body.balance);
}

const savingsBalance = () => {
  return Promise.all([
    genericBalance('PRIVATE'),
    genericBalance('FUTURES'),
    genericBalance('FUNDS'),
    genericBalance('GOVERNMENT'),
    genericBalance('STOCKS')
  ].map(p => p.catch(e => e)))
    .then(balances => balances
                        .filter(b => !b.error)
                        .reduce((m, i) => m + i, 0))
    .then(balance => {
      return `Savings account balance: R$ ${balance.toFixed(2)}`;
    });
}

const checkingBalance = () => {
  return genericBalance('DEPOSIT')
    .then(balance => {
      return `Checking account balance: R$ ${balance.toFixed(2)}`;
    });
}

module.exports = {
  authorize: authorize,
  balances: () => {
    if (!nconf.get('easynvest:auth:token')) {
      authorize();
    } else {
      checkLogin()
        .catch(authorize)
        .then(checkingBalance)
        .then(console.log)
        .then(savingsBalance)
        .then(console.log);
    }
  }
}
