<<<<<<< HEAD
const db = require("../database/dbConfig.js");
=======
const db = require("../database/connection.js");
>>>>>>> upstream/main

module.exports = {
  add,
  find,
  findBy,
  findById,
};

function find() {
<<<<<<< HEAD
  return db("users").select("id", "username");
}

function findBy(filter) {
  return db("users").where(filter);
}

async function add(user) {
  const [id] = await db("users").insert(user, "id");

  return findById(id);
}

function findById(id) {
  return db("users")
    .where({ id })
    .first();
=======
  return db("users").select("id", "username").orderBy("id");
}

function findBy(filter) {
  return db("users").where(filter).orderBy("id");
}

async function add(user) {
  try {
    const [id] = await db("users").insert(user, "id");

    return findById(id);
  } catch (error) {
    throw error;
  }
}

function findById(id) {
  return db("users").where({ id }).first();
>>>>>>> upstream/main
}
