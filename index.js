/*
Copyright (C) 2017 Igor Borges

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';
global.fetch = global.fetch || require('isomorphic-fetch');
const __ = require('lodash');

const modules = require('./modules/index');
let config = {};

const funOnEachModule = (brokers, fun) => {
  return brokers.map(m => modules[m]).filter(__.identity).map(m => m(config)[fun]())
}

const details = (brokers) => {
  return Promise.all(funOnEachModule(brokers, 'details')).then(__.flatten);
}

module.exports = (configuration) => {
  config = configuration;
  return {
    details: details,
    funOnEachModule: funOnEachModule,
  };
}
