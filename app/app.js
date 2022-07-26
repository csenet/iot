let awsIot = require('aws-iot-device-sdk');
const APIController = require('./ClipVieverAPI');
const device = awsIot.device({
  keyPath: `certs/${process.env.thingName}.private.key`,
  certPath: `certs/${process.env.thingName}.cert.pem`,
  caPath: 'certs/root-CA.crt',
  clientId: process.env.awsClientId,
  region: undefined,
  baseReconnectTimeMs: 4000,
  keepalive: 300,
  protocol: 'mqtts',
  port: undefined,
  host: process.env.awsHost,
  debug: false
});

const apiKey = process.env.apiKey;
const username = process.env.username;
const password = process.env.password;

const api = new APIController(username, password, apiKey);

device
  .on('connect', function () {
    console.log('connect');
  });
device
  .on('close', function () {
    console.log('close');
  });
device
  .on('reconnect', function () {
    console.log('reconnect');
  });
device
  .on('offline', function () {
    console.log('offline');
  });
device
  .on('error', function (error) {
    console.log('error', error);
  });
device
  .on('message', function (topic, payload) {
    console.log('message', topic, payload.toString());
  });

let prevDataTimeStamp = null;

async function sendData() {
  const data = await api.getEnviromentData();
  if (prevDataTimeStamp != data.timeStamp) {
    device.publish('co2', JSON.stringify(data));
    prevDataTimeStamp = data.timeStamp;
  }
}

async function main() {
  await api.issueAccessToken();
  await sendData();
  setInterval(sendData, 1 * 60 * 1000);
  setInterval(api.issueAccessToken, 5 * 60 * 1000);
}

main();