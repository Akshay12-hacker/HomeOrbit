const fs = require('fs');
const path = require('path');

module.exports = function (api) {
  api.cache.using(() => {
    const envPath = path.join(__dirname, '.env');
    return fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  });
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv']
    ],
  };
};
