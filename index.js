#! /usr/bin/env node
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
const _ = require('lodash');
const neodoc = require('neodoc');
const modules = require('require-all')({
  dirname: __dirname + '/modules'
});

const doc = `Usage:
  balances [options] (${_.keys(modules).join('|')})
  balances all

Options:
  -a, --auth     Just authenticate.
  -d, --details  Show details.
  -h, --help     Show this help.
`
const opts = neodoc.run(doc, {optionsFirst: true, smartOptions: true});

const selected = _.keys(modules).filter(m => opts[m])[0];
if (selected) {
  if (opts['--auth'])
    modules[selected].authorize();
  else if (opts['--details'])
    modules[selected].details();
  else
    modules[selected].balances();
} else if (opts.all) {
  Promise.all(_.keys(modules).map(m => modules[m].balances()));
}
