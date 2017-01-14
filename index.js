'use strict';
const rp = require('request-promise');
const _ = require('lodash');
const he = require('he');
//s
const login = 'xxxxxx-x';
let viewstate = '';
let idSelect = '';
let html = '';
let virtualKeyboard = {};
let idSubmitPassword = {};
let passwordSubmitted = false;
let contaButton = '';
let investimentosButton = '';

function typeCharacter(keyboardCode) {
  let form = {
    'frmLogin': 'frmLogin',
    'javax.faces.ViewState': viewstate,
    'login': login,
    'javax.faces.source': keyboardCode,
    'javax.faces.partial.event': 'click',
    'javax.faces.partial.execute': keyboardCode + ' ' + keyboardCode,
    'javax.faces.partial.render': 'panelTeclado',
    'javax.faces.behavior.event': 'action',
    'javax.faces.partial.ajax': 'true'
  };
  form[idSelect] = 'CLIENTE_RENDA_FIXA';

  const options2 = {
    method: 'POST',
    uri: 'https://internetbanking.intermedium.com.br/login.jsf',
    form: form,
    jar: true,
    resolveWithFullResponse: true
  };

  return rp(options2);
}

const options1 = {
  method: 'GET',
  uri: 'https://internetbanking.intermedium.com.br/login.jsf',
  jar: true,
  resolveWithFullResponse: true
};

rp(options1).then(response => {
  viewstate = response.body.match(/name="javax.faces.ViewState"[^>]*value="([^"]+)"/)[1];
  idSelect = response.body.match(/<select id="([^"]+)"/)[1];
  const idSubmit = response.body.match(/<input type="submit" name="([^"]+)"/)[1];

  let form = {
    'frmLogin': 'frmLogin',
    'javax.faces.ViewState': viewstate,
    'login': login
  };
  form[idSelect] = 'CLIENTE_RENDA_FIXA';
  form[idSubmit] = 'Aguarde ...';

  const options2 = {
    method: 'POST',
    uri: 'https://internetbanking.intermedium.com.br/login.jsf',
    form: form,
    jar: true,
    resolveWithFullResponse: true
  };

  return rp(options2);
}).then(response => {
  viewstate = response.body.match(/name="javax.faces.ViewState"[^>]*value="([^"]+)"/)[1];
  const idName = response.body.match(/<a id="([^"]+)"[^>]*panelGeral/)[1];

  let form = {
    'frmLogin': 'frmLogin',
    'javax.faces.ViewState': viewstate,
    'login': login,
    'javax.faces.source': idName,
    'javax.faces.partial.event': 'click',
    'javax.faces.partial.execute': idName + ' panelGeral',
    'javax.faces.partial.render': 'panelGeral',
    'javax.faces.behavior.event': 'action',
    'javax.faces.partial.ajax': 'true'
  };
  form[idSelect] = 'CLIENTE_RENDA_FIXA';

  const options2 = {
    method: 'POST',
    uri: 'https://internetbanking.intermedium.com.br/login.jsf',
    form: form,
    jar: true,
    resolveWithFullResponse: true
  };

  return rp(options2);
}).then(response => {
  idSubmitPassword = response.body.match(/<input id="([^"]+)" type="submit"[^>]*value="Confirmar"/)[1];
  _.extend(virtualKeyboard,
    _(response.body.match(/<input id="([^"]+)"[^>]*class="btsResgate"/g))
      .map((input) => [he.decode(input.match(/value="([^"]+)"/)[1]), input.match(/id="([^"]+)"/)[1]])
      .fromPairs()
      .value());

  return typeCharacter(virtualKeyboard['!?.']);
}).then(response => {
  _.extend(virtualKeyboard,
    _(response.body.match(/<input id="([^"]+)"[^>]*class="btsResgate"/g))
      .map((input) => [he.decode(input.match(/value="([^"]+)"/)[1]), input.match(/id="([^"]+)"/)[1]])
      .fromPairs()
      .value());

  return typeCharacter(virtualKeyboard['ABC']);
}).then(() => typeCharacter(virtualKeyboard['x']))
  .then(() => typeCharacter(virtualKeyboard['x']))
  .then(() => typeCharacter(virtualKeyboard['x']))
  .then(() => typeCharacter(idSubmitPassword))
  .then(response => {
    const options1 = {
      method: 'GET',
      uri: 'https://internetbanking.intermedium.com.br/comum/home.jsf',
      jar: true,
      resolveWithFullResponse: true
    };

    return rp(options1);
  })
  .then(response => {
    viewstate = response.body.match(/name="javax.faces.ViewState"[^>]*value="([^"]+)"/)[1];
    contaButton = response.body.match(/SALDO C\/C<\/b><a id="([^"]+)"[^>]*frmSaldos/)[1];

    let form = {
      'frmSaldos': 'frmSaldos',
      'javax.faces.ViewState': viewstate,
      'javax.faces.source': contaButton,
      'javax.faces.partial.event': 'click',
      'javax.faces.partial.execute': contaButton + ' ' + contaButton,
      'javax.faces.partial.render': 'frmSaldos',
      'javax.faces.behavior.event': 'action',
      'javax.faces.partial.ajax': 'true'
    };

    const options2 = {
      method: 'POST',
      uri: 'https://internetbanking.intermedium.com.br/comum/home.jsf',
      form: form,
      jar: true,
      resolveWithFullResponse: true
    };

    return rp(options2);
  })
  .then(response => {
    investimentosButton = response.body.match(/INVESTIMENTOS<\/b><a id="([^"]+)"[^>]*frmSaldos/)[1];

    let form = {
      'frmSaldos': 'frmSaldos',
      'javax.faces.ViewState': viewstate,
      'javax.faces.source': investimentosButton,
      'javax.faces.partial.event': 'click',
      'javax.faces.partial.execute': investimentosButton + ' ' + investimentosButton,
      'javax.faces.partial.render': 'frmSaldos',
      'javax.faces.behavior.event': 'action',
      'javax.faces.partial.ajax': 'true'
    };

    const options2 = {
      method: 'POST',
      uri: 'https://internetbanking.intermedium.com.br/comum/home.jsf',
      form: form,
      jar: true,
      resolveWithFullResponse: true
    };

    return rp(options2);
  })
  .then(response => {
    const saldoCC = parseFloat(response.body.match(/<span class="spanValores">[^\/]*R\$ ([0-9,\.]+)<\/span>/)[1].replace('.', '').replace(',', '.'));
    const saldoInvestimentos = parseFloat(response.body.match(/totalResultados">R\$ ([0-9,\.]+)/)[1].replace('.', '').replace(',', '.'));
    console.log('Total balance: R$ ' + (saldoCC + saldoInvestimentos));
  });
