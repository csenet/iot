const axios = require('axios');

module.exports = class APIController {
  constructor(username, password, apiKey) {
    this.username = username;
    this.password = password;
    this.apiKey = apiKey;
    this.accessToken = null;
  }

  async issueAccessToken() {
    const data = JSON.stringify({
      "username": this.username,
      "password": this.password
    });

    const config = {
      method: 'post',
      url: 'https://api.clip-viewer-lite.com/auth/token',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      data: data
    };
    this.accessToken = (await axios(config)).data.token;
  }

  async getLastData() {
    // if (this.accessToken === null) await this.issueAccessToken();
    var config = {
      method: 'get',
      url: `https://api.clip-viewer-lite.com/payload/latest/${this.ClipdeviceId}`,
      headers: {
        'Authorization': this.accessToken,
        'X-API-Key': this.apiKey
      }
    };

    let response;
    try {
      response = (await axios(config));
    } catch (error) {
      if (error.code === "ERR_BAD_REQUEST") {
        await this.issueAccessToken();
        config.headers.Authorization = this.accessToken;
        response = (await axios(config));
      }
    }

    return response.data;
  }

  async getEnviromentData() {
    const data = (await this.getLastData()).payload[0];
    const timeStamp = data.sendDateTime;
    const temprature = parseFloat(data.temperature);
    const humidity = parseFloat(data.humidity);
    const co2 = data.carbonDioxide;
    const output = {
      timeStamp: timeStamp,
      temprature: temprature,
      humidity: humidity,
      co2: co2
    }
    return output;
  };
}