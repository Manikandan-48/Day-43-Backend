const express = require('express')
const router = express.Router()

const Quote = require('../Models/quote.model')


router.post('/addQuote', async (req, res) => {

  payload = req.body
       let quote = new Quote(payload)

  await quote.save((err, data) => {

    if (err) {

      return res.status(400).send({
        message: 'Error while adding Quote❗'
      })
    }
    return res.status(201).send({
      message: 'Quote added successfully👍🏼',
      user: data
    })
  })
})

router.get('/getQuote', (req, res) => {

  Quote.find((err, data) => {

    if (err) {
      return res.status(400).send({
        message: 'Error while getting Quote❗'
      })
    }
    
    return res.status(201).send(data)
  })
})

module.exports = router
