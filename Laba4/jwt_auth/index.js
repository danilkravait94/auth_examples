var request = require("request");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const port = 3000;
require('dotenv').config({path: __dirname + '/.env'})

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';

function create_user(res, email, given_name, family_name, name, nickname, password) {
  var create_user_options = {
      method: 'POST',
      url: `https://${process.env.DOMAIN}/api/v2/users`,
      headers: {
          'content-type': 'x-www-form-urlencoded',
          'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
      },
      form: {
          "email": email,
          "given_name": given_name,
          "family_name": family_name,
          "name": name,
          "nickname": nickname,
          "connection": "Username-Password-Authentication",
          "password": password
      }
  };
  
  request(create_user_options, function (error, response, body) {
    console.log('Status from Create user: '+ response.statusMessage)
        res.status(response.statusCode).send();
  });
}

app.use((req, res, next) => {
  let fulltoken = req.get(SESSION_KEY);
  if (fulltoken) {
    let token = JSON.parse(fulltoken)
    if (token.expires < Date.now() / 1000) {
      debugger
      var refresh_token_options = {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/oauth/token`,
        headers: {
            'content-type': 'x-www-form-urlencoded',
            'Authorization': `Bearer ${process.env.USER_ACCESS_TOKEN}`
        },
        form: {
            grant_type: 'refresh_token',
            audience: process.env.AUDIENCE,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            refresh_token: process.env.USER_REFRESH_TOKEN
        }
      };
      
      request(refresh_token_options, function (error, response, body) {
          if (error) throw new Error(error);
        
          const info = JSON.parse(body);
          process.env.USER_ACCESS_TOKEN = info.access_token
          console.log(`Refreshed Token: ${info.access_token}`);
          token = JSON.stringify({ token: info.access_token, expires: info.expires_in})
      });
    }
    req.token = token;
  }

  next();
});

app.get('/', (req, res) => {
  if (req.username) {
    return res.json({
      username: req.username,
      logout: 'http://localhost:3000/logout',
    });
  }
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/register', (req, res) => {
  if (req.username) {
    return res.json({
      username: req.username,
      logout: 'http://localhost:3000/logout',
    });
  }
  res.sendFile(path.join(__dirname + '/register.html'));
});

app.get('/logout', (req, res) => {
  res.redirect('/');
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  var options = {
    method: 'POST',
    url: `https://${process.env.DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form:
    {
        audience: process.env.AUDIENCE,
        grant_type: 'password',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        username: login,
        password: password,
        scope: 'offline_access'
    }
};

  request(options, function (error, response, body) {
    if (error) {
      res.status(401).send();
      return
    }

    const status = response.statusCode

    if (status >= 200 && status < 300) {
      const info = JSON.parse(body);
    
      process.env.USER_ACCESS_TOKEN = info.access_token;
      process.env.USER_REFRESH_TOKEN = info.refresh_token;
      console.log(`access_token Token: ${info.access_token}`);
      console.log(`refresh_token Token: ${info.refresh_token}`);
      console.log(`expires_in Date: ${info.expires_in}`);
      res.json( { token: info.access_token, expires: info.expires_in} );
      return
    }

    res.status(401).send();
  });

  
});

app.post('/api/register', (req, res) => {
  console.log(req.body)
  create_user(res, req.body.email, req.body.givenname, req.body.familyname, req.body.nickname, req.body.name, req.body.password)
  return;
});

var options = {
  method: 'POST',
  url: `https://${process.env.DOMAIN}/oauth/token`,
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  form:
  {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      audience: process.env.AUDIENCE,
      grant_type: 'client_credentials'
  }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  const info = JSON.parse(body);

  process.env.ACCESS_TOKEN = info.access_token;
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});