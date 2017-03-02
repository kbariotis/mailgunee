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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var apiKey = '';
var domain = '';
var baseMessagesUrl = '';
var baseDomainsUrl = '';

var setup = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var file, key, answer;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            file = _os2.default.homedir() + '/.mailgun-previewer';
            key = null;
            _context.prev = 2;

            key = _fs2.default.readFileSync(file);
            _context.next = 15;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context['catch'](2);

            console.log('This is the first time you are using Mailgun previewer');
            console.log('You need to provide the API key (stored in ~/.mailgun-previewer');

            _context.next = 12;
            return _inquirer2.default.prompt([{
              type: 'input',
              name: 'key',
              message: 'Provide your API key'
            }]);

          case 12:
            answer = _context.sent;


            key = answer.key;

            try {
              _fs2.default.writeFileSync(file, key);
            } catch (e) {
              console.log(e);
            }

          case 15:
            return _context.abrupt('return', key);

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[2, 6]]);
  }));

  return function setup() {
    return _ref.apply(this, arguments);
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
    var spinner = new _cliSpinner.Spinner('processing.. %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();

    (0, _request2.default)('' + url, function (err, response) {
      spinner.stop();
      console.log('\x1Bc');
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(response.body));
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
    message: 'Choose a message to render',
    choices: messages,
    paginated: false
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
    paginated: false
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

var renderDomains = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : baseDomainsUrl;
    var eventsBody, items;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return request(url);

          case 2:
            eventsBody = _context2.sent;
            items = eventsBody.items.map(function (item) {
              return item.name;
            });
            _context2.next = 6;
            return renderDomainsList(items);

          case 6:
            return _context2.abrupt('return', _context2.sent);

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function renderDomains() {
    return _ref2.apply(this, arguments);
  };
}();

var renderMessages = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : baseMessagesUrl;

    var eventsBody, items, presentedItems, selection, _url, messageBody, exit;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return request(url);

          case 2:
            eventsBody = _context3.sent;
            items = eventsBody.items;
            presentedItems = formatOptions(items).concat(['more']);
            _context3.next = 7;
            return renderMessagesList(presentedItems);

          case 7:
            selection = _context3.sent;

            if (!(selection === 'more')) {
              _context3.next = 12;
              break;
            }

            renderMessages(baseMessagesUrl + '&begin=' + items[items.length - 1].timestamp);
            _context3.next = 21;
            break;

          case 12:
            _url = getSelectionUrl(items, selection);
            _context3.next = 15;
            return request('' + _url);

          case 15:
            messageBody = _context3.sent;


            console.log(messageBody['body-html']);

            _context3.next = 19;
            return renderConfirmationToExit();

          case 19:
            exit = _context3.sent;


            if (!exit) {
              renderMessages();
            }

          case 21:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function renderMessages() {
    return _ref3.apply(this, arguments);
  };
}();

var run = function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return setup();

          case 2:
            apiKey = _context4.sent;


            baseDomainsUrl = 'https://api:' + apiKey + '@api.mailgun.net/v3/domains';
            _context4.next = 6;
            return renderDomains();

          case 6:
            domain = _context4.sent;


            baseMessagesUrl = 'https://api:' + apiKey + '@api.mailgun.net/v3/' + domain + '/events?limit=10';
            renderMessages();

          case 9:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function run() {
    return _ref4.apply(this, arguments);
  };
}();

exports.renderMessages = renderMessages;
exports.default = run;
exports.request = request;
exports.setup = setup;
exports.getSelectionUrl = getSelectionUrl;
exports.formatOptions = formatOptions;
exports.formatDate = formatDate;