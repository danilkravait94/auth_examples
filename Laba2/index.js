var request = require("request");
require('dotenv').config({path: __dirname + '/.env'})

function create_user(token) {
    var create_user_options = {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/api/v2/users`,
        headers: {
            'content-type': 'x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
        },
        form: {
            "email": "danilkrava4+1@gmail.com",
            "given_name": "Danil",
            "family_name": "Kravchenko",
            "name": "Danil Kravchenko",
            "nickname": "danilkrava4",
            "connection": "Username-Password-Authentication",
            "password": "Krava040702"
        }
    };
    
    request(create_user_options, function (error, response, body) {
        if (error) throw new Error(error);
      
        console.log(body);
    });
}

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
    create_user(info.access_token)
});
