'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatDate = exports.formatOptions = exports.getSelectionUrl = exports.setup = exports.request = exports.default = exports.renderMessages = undefined;

require('babel-core/register');

require('babel-polyfill');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _cliSpinner = require('cli-spinner');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = console.log;

var apiKey = '';
var domain = '';
var baseMessagesUrl = '';
var baseDomainsUrl = '';

var apiKeyFile = '.mailgunee';

/**
 * Orchestrate the CLI interface
 */
var run = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var domainsList, exit;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return setup();

          case 2:
            apiKey = _context.sent;


            baseDomainsUrl = 'https://api:' + apiKey + '@api.mailgun.net/v3/domains';
            _context.next = 6;
            return fetchDomains();

          case 6:
            domainsList = _context.sent;
            _context.next = 9;
            return renderDomainsList(domainsList);

          case 9:
            domain = _context.sent;

            baseMessagesUrl = 'https://api:' + apiKey + '@api.mailgun.net/v3/' + domain + '/events?limit=10';
            _context.next = 13;
            return renderMessages();

          case 13:
            _context.next = 15;
            return renderConfirmationToExit();

          case 15:
            exit = _context.sent;


            if (!exit) {
              run();
            }

          case 17:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function run() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Initial setup to get the API key
 */
var setup = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var file, key, answer;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            file = _os2.default.homedir() + '/' + apiKeyFile;
            key = null;
            _context2.prev = 2;

            key = _fs2.default.readFileSync(file);
            _context2.next = 14;
            break;

          case 6:
            _context2.prev = 6;
            _context2.t0 = _context2['catch'](2);

            log('\nThis is the first time you are using mailgunee. ' + _chalk2.default.bold('Thank you for checking it out!') + '\nYou need to provide your API key (stored in ~/' + apiKeyFile + ').\n');

            _context2.next = 11;
            return _inquirer2.default.prompt([{
              type: 'input',
              name: 'key',
              message: 'Provide your API key'
            }]);

          case 11:
            answer = _context2.sent;


            key = answer.key;

            try {
              _fs2.default.writeFileSync(file, key);
            } catch (e) {
              log(_chalk2.default.bold('Oh no!') + ', e');
            }

          case 14:
            return _context2.abrupt('return', key);

          case 15:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[2, 6]]);
  }));

  return function setup() {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Render domains list
 */
var fetchDomains = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : baseDomainsUrl;
    var eventsBody;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return request(url);

          case 2:
            eventsBody = _context3.sent;
            return _context3.abrupt('return', eventsBody.items.map(function (item) {
              return item.name;
            }));

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function fetchDomains() {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Render messages list
 *
 * Will recursively call itself if user chooses not to exit
 */
var renderMessages = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : baseMessagesUrl;

    var eventsBody, items, presentedItems, selection, _url, messageBody;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return request(url);

          case 2:
            eventsBody = _context4.sent;
            items = eventsBody.items;

            if (items.length) {
              _context4.next = 7;
              break;
            }

            _chalk2.default.bold('There are no messages to preview.');
            return _context4.abrupt('return');

          case 7:
            presentedItems = formatOptions(items).concat(['More']);
            _context4.next = 10;
            return renderMessagesList(presentedItems);

          case 10:
            selection = _context4.sent;

            if (!(selection === 'More')) {
              _context4.next = 16;
              break;
            }

            _context4.next = 14;
            return renderMessages(baseMessagesUrl + '&begin=' + items[items.length - 1].timestamp);

          case 14:
            _context4.next = 21;
            break;

          case 16:
            _url = getSelectionUrl(items, selection);
            _context4.next = 19;
            return request('' + _url);

          case 19:
            messageBody = _context4.sent;


            log('\n' + _chalk2.default.bold(messageBody['Subject']) + '\n' + messageBody['stripped-html'] + '\n    ');

          case 21:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function renderMessages() {
    return _ref4.apply(this, arguments);
  };
}();

var formatDate = function formatDate(date) {
  var dd = date.getDate();
  var MM = date.getMonth() + 1;
  var yy = date.getFullYear().toString().substring(2, 4);
  var hh = date.getHours();
  var mm = date.getMinutes();
  var ss = date.getSeconds();

  return MM + '/' + dd + '/' + yy + ' - ' + hh + ':' + mm + ':' + ss;
};

var request = function request(url) {
  return new Promise(function (resolve, reject) {
    var spinner = new _cliSpinner.Spinner('Wait.. %s');

    spinner.setSpinnerString('|/-\\');
    spinner.start();

    (0, _request2.default)('' + url, function (err, response) {
      spinner.stop();

      log('\x1Bc'); // clear the terminal

      if (err) {
        reject(err);
      } else {
        var body = null;

        try {
          body = JSON.parse(response.body);
        } catch (e) {
          reject(e);
          return;
        }

        resolve(body);
      }
    });
  });
};

var formatOptions = function formatOptions(options) {
  return options.map(function (item) {
    return formatDate(new Date(item.timestamp * 1000)) + ' / ' + item.recipient + ' / ' + item.id;
  });
};

var getSelectionUrl = function getSelectionUrl(items, selection) {
  var id = selection.split(' / ')[2];

  var message = items.filter(function (item) {
    return item.id === id;
  })[0];
  return message.storage.url.replace('https://', 'https://api:' + apiKey + '@');
};

var renderMessagesList = function renderMessagesList(messages) {
  return _inquirer2.default.prompt([{
    type: 'list',
    name: 'message',
    message: 'Choose a message to preview',
    choices: messages,
    paginated: false,
    pageSize: 11
  }]).then(function (answer) {
    return answer.message;
  });
};

var renderDomainsList = function renderDomainsList(domains) {
  return _inquirer2.default.prompt([{
    type: 'list',
    name: 'domain',
    message: 'Choose a domain',
    choices: domains,
    paginated: false,
    pageSize: 20
  }]).then(function (answer) {
    return answer.domain;
  });
};

var renderConfirmationToExit = function renderConfirmationToExit() {
  return _inquirer2.default.prompt([{
    type: 'confirm',
    name: 'exit',
    message: 'Quit now?',
    default: false
  }]).then(function (answer) {
    return answer.exit;
  });
};

exports.renderMessages = renderMessages;
exports.default = run;
exports.request = request;
exports.setup = setup;
exports.getSelectionUrl = getSelectionUrl;
exports.formatOptions = formatOptions;
exports.formatDate = formatDate;