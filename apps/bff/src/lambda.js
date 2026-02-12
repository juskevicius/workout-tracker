const serverlessExpress = require('@codegenie/serverless-express');
const { app } = require('./express-server/main');

exports.handler = serverlessExpress({ app, resolutionMode: 'PROMISE' });
