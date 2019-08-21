const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
// ----------------------------------
// this is where we add bcryptjs for our
// use...
const bcrypt = require('bcryptjs');
// ----------------------------------

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());
 
server.get('/', (req, res) => {
  res.send("It's alive!");
});

// in this method, we extract the user object info
// from the req.body.
// we then hash the password using bcrypt
// and store the hash on the user object before
// passing it in to Users.add, so it's thje *hash* 
// that is stored in the DB, not the plain text password.
//
// note that the hash is a hash of the user's password,
// plus a "salt" string. Salt is a random string that is
// appended to the password before the hashing algorithm
// is executed. The salt can be provided by you, or you
// can allow bcrypt to generate a salt string automatically
// (this is the default).
//
// in this way, the hash that we put in our database is not
// easily recognizable. Someone with a "rainbow table" can't 
// do a simple lookup for the hash you have stored. (A rainbow table 
// is a list of pre-computed hashes that they can use to try to look
// up a password, after they gain unauthorized access to  your
// database)
//
server.post('/api/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

//
// note that "401" is the proper HTTP result code to send if someone
// is not authenticated. This is what you will find with typical
// REST-based API's. Thus, developers using *your* API are likely
// to expect this.
//
// If someone *is* authenticated, but doesn't have *permission*
// to access what they are trying to access, you should respond
// with a 403.
//
// see https://restfulapi.net/http-status-codes/
// see https://www.restapitutorial.com/httpstatuscodes.html 
//
//
// we use the "validate()" middleware method to validate the 
// credentials. If the credentials are bad, the validate()
// method will respond with a 401 before our handler here
// is able to process.
//
server.post('/api/login', validate, (req, res) => {
  let { username } = req.headers;

  // we don't need to look up the user, because
  // that was already done by the validate() method.
  res.status(200).json({ message: `Welcome ${user.username}!` });

  // any error conditions will have been handled by validate() as well.
});

//
// we want this API endpoint to be protected by authentication...
// a user must provide valid credentials in order to get a list of
// users.
//
// we accomplish this through middleware... the "validate" method
// below.
//
server.get('/api/users', validate, (req, res) => {

  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

//
// this method validates credentials passed in headers.
// we want the credentials in the headers because we want to be
// able to validate ANY request (GET, PUT, POST, DELETE, or others).
//
// you can't pass a body in a GET or DELETE request, so credentials
// must be in the headers.
//
function validate(req, res, next) {
  const {username, password} = req.headers;

  // if both the username and password headers are found...
  if (username && password) {
    // look up the user
    Users.findBy({username})
    .first()
    .then(user => {
      // if the user is found in the DB
      // AND the password supplied hashes to the same hash
      // that is stored...
      if (user && bcrypt.compareSync(password, user.password)) {
        // go to the next middleware handler
        next();
      } else {
        // otherwise, respond with a 401
        res.status(401).json({message: "Invalid credentials"});
      }
    })
    // if our DB model module has a problem with the request,
    // we will just return a 500 (kinda lazy of us, but it's just
    // a demo)
    .catch(err => {
      res.status(500).json({message:"unexpected error"});
    });
  // if either the username or the password are not supplied in 
  // the request headers, respond with a 400.
  } else {
    res.status(400).json({message:"no credentials provided"});
  }
}

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
