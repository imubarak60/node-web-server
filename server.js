const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
var Ravepay = require('ravepay');

//var rave = new Ravepay(PUBLICK_KEY, SECRET_KEY, PRODUCTION_FLAG);

var rave = new Ravepay("FLWPUBK-3d3f809381a3462b48203d1dac0df2a8-X", "FLWSECK-903218936fa64f35189812ae2f2a5cdc-X", true);


const port =process.env.PORT||3000;

var app = express();

hbs.registerPartials(__dirname+'/views/partials')

app.set('view engine', 'hbs');


app.use((req, res, next)=>{
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;
  //console.log(`${now}: ${req.method} ${req.url}`);
  console.log(log);
  fs.appendFile('server.log', log + '\n', (err)=>{
    if(err) {
      console.log('Unable to append to server.log')
    }
  });
  next();
});

// app.use((req, res, next)=> {
//   res.render('maintenance.hbs')
// })
app.use(express.static(__dirname+'/public'));
hbs.registerHelper('getCurrentYear', ()=>{
  return new Date().getFullYear();
});
hbs.registerHelper('screamIt', (text)=>{
  return text.toUpperCase();
});

app.get('/', (req, res) => {
  //res.send('<h1>Hello Express!</>');

res.render('home.hbs',{
   pageTitle : 'Home Page',
   WelcomeMessage: 'Welcome to my Website',
   currentYear: new Date().getFullYear()

 })

});



// app.get('/projects',(req, res)=>{
//   res.render('projects.hbs',{
//     pageTitle: 'projects'
//   })
// });
// app.get('/bad', (req, res)=>{
//   res.send({
//     errorMessage : 'Unable to handle request',
//     why : 'you made a mistake',
//
//   })
// });

var payload = {
            "cardno": "5438898014560229",
            "cvv": "789",
            "expirymonth": "07",
            "expiryyear": "18",
            "currency": "NGN",
            "pin": "7552",
            "country": "NG",
            "amount": "10",
            "email": "user@example.com",
            "phonenumber": "1234555",
            "suggested_auth": "PIN",
            "firstname": "user1",
            "lastname": "user2",
            "IP": "355426087298442",
            "txRef": "MC-7663-YU",
            "device_fingerprint": "69e6b7f0b72037aa8428b70fbe03986c"
};
Promise.all([
  rave.Card.charge(payload).then(resp => {
    var response;
    if(resp.body && resp.body.data && resp.body.data.flwRef){
      response = resp.body.data.flwRef;
    } else{
      response = new Error("Couldn't get response, this is being fixed");
      throw response;
    }

    return response;
  })
  .catch(err => {
    console.log("P: ",err.message);
  })
]).then(ref => {
  console.log("this is ref: ",ref);
  var payload2 = {
                "PBFPubKey": "FLWPUBK-3d3f809381a3462b48203d1dac0df2a8-X",
                "transaction_reference": ref,
                "otp": "12345"
                }
  rave.Card.validate(payload2).then(resp => {
      return resp.body;
  })
    .catch(err => {
      console.log("got this error: ",err.message);
    })
})
app.listen(port, () => {
  console.log('Server is on port '+port);
});
