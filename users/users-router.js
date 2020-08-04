const router = require("express").Router();

const Users = require("./users-model.js");

router.get("/", (req, res) => {
  Users.find()
    .then(users => {
<<<<<<< HEAD
      res.json(users);
=======
      res.status(200).json(users);
>>>>>>> upstream/main
    })
    .catch(err => res.send(err));
});

module.exports = router;
