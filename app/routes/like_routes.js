// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/

// pull in Mongoose model for like
const Like = require('../models/like')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /like
router.get('/likes', (req, res, next) => {
  Like.find()
    .then(like => {
      // `like` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return like.map(example => example.toObject())
    })
    // respond with status 200 and JSON of the like
    .then(like => res.status(200).json({ like: like }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /like
router.post('/like', (req, res, next) => {
  // set owner of new example to be current user

  Like.create(req.body.example)
    // respond to succesful `create` with status 201 and JSON of new "example"
    .then(example => {
      res.status(201).json({ example: example.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /like/5a7db6c74d55bc51bdf39793
router.patch('/like/:id', (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair

  Like.findById(req.params.id)
    .then(handle404)
    .then(like => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner

      // pass the result of Mongoose's `.update` to the next `.then`
      return like.updateOne(req.body.example)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
