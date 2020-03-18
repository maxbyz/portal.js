/* eslint-disable camelcase */

const chromedriver = require('chromedriver');
const geckodriver = require('geckodriver');

function chrome(locale = 'en-GB', args = []) {
  args = ['disable-gpu', `--lang=${locale}`, '--allow-insecure-localhost'].concat(args);
  return {
    webdriver: {
      server_path: chromedriver.path
    },
    desiredCapabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args,
        prefs: {
          'intl.accept_languages': locale
        }
      }
    }
  };
}

function headlessChrome(locale = 'en-GB') {
  return chrome(locale, ['headless']);
}

module.exports = {
  custom_commands_path: ['./node_modules/nightwatch-accessibility/commands'],
  custom_assertions_path: ['./tests/features/config/assertions'],
  test_settings: {
    default: {
      globals: {
        url: 'https://localhost:3001'
      },
      webdriver: {
        start_process: true,
        port: 4444,
        cli_args: ['--port=4444', '--log', 'debug']
      },
      desiredCapabilities: {
        javascriptEnabled: true,
        acceptSslCerts: true
      }
    },
    chrome: chrome(),
    'chrome-ja': chrome('ja'),
    'chrome-nl': chrome('nl'),
    chromeHeadless: headlessChrome(),
    'chromeHeadless-ja': headlessChrome('ja'),
    'chromeHeadless-nl': headlessChrome('nl'),
    gecko: {
      webdriver: {
        server_path: geckodriver.path
      },
      desiredCapabilities: {
        browserName: 'firefox'
      }
    }
  }
};
