const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SECRET = 'danil_secret';

const EXPIRATION_TIME = '10s'
const SESSION_KEY = 'Authorization';


function verifyToken(token) {
    if (token == null) {
        return null;
    }

    const data = jwt.verify(token, SECRET);
    if (data == null) {
        return null;
    }

    const user = users.find(u => u.login == data.login);
    if (user == null) {
        return null;
    }

    return user.username;
}

app.use((req, res, next) => {
  const sessionId = req.get(SESSION_KEY);

  req.username = verifyToken(sessionId);
  req.sessionId = sessionId;

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

app.get('/logout', (req, res) => {
  res.redirect('/');
});

const users = [
  {
    login: 'Login',
    password: 'Password',
    username: 'Username',
  },
  {
    login: 'Danil-Krava',
    password: '040702',
    username: 'Danil Kravchenko',
  }
];

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  const user = users.find(user => {
    if (user.login == login && user.password == password) {
      return true;
    }
    return false;
  });

  if (user) {
    const token = jwt.sign(
        {
            login: user.login
        },
        SECRET,
        {
            expiresIn : EXPIRATION_TIME
        }
    );

    console.log('JWT: ' + token);
    res.json({ token });
  }

  res.status(401).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});