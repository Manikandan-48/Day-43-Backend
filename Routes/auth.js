const express = require('express')
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const router = express.Router()
const Users = require('../Models/user.model')


//TO SIGNUP:

router.post('/signup', async (req, res) => {

  try {
    const payload = req.body
    payload.hashedPassword = await bcrypt.hash(payload.password, 10)

    delete payload.password

    let user = new Users(payload) 

    await user.save((err, data) => {

      if (err) {

        return res.status(400).send({
          message: ' User Already Exist❗'
        })
      }
      return res.status(201).send({
        message: 'User is registered successfully👍🏼',
        user: data
      })
    })

  }
   catch (err) {
    console.log('Error: ', err)
    return res.status(500).send({
      message: 'Internal Server Error🚫'
    })
  }
})



// TO SIGNIN:

router.post('/signin', async (req, res) => {

  try {
    const { email, password } = req.body

    const existingUser = await Users.findOne({ email: email })
    console.log('Existing User: ', existingUser)

    if (existingUser) {
      const isValidUser = await bcrypt.compare(

        password,
        existingUser.hashedPassword
      ) 

      console.log('IsValid:', isValidUser)
      if (isValidUser) {

        const token = jwt.sign(
          { _id: existingUser._id },
          process.env.SECRET_KEY
        )

        res.cookie('entryToken', token, {
          expires: new Date(Date.now() + 25892000000)
        })

        const { _id, name, email, role } = existingUser
        return res

          .status(200)
          .send({ token: token, user: { _id, email, name, role } })
      }

      return res.status(400).send({
        message: 'Either email id or password is not matching❗'
      })
    }

    return res.status(400).send({
      message: "User does not exist❌"
    })
  } 
  catch (err) {

    return res.status(500).send({
      message: 'Internal Server Error🚫'
    })
  }
})



// TO SEND OTP:

router.post('/send-otp', async (req, res) => {
  try {
    const _otp = Math.floor(100000 + Math.random() * 900000)

    console.log(`OTP is : ${_otp}`)

        let user = await Users.findOne({ email: req.body.email })

          console.log(user)

    if (!user) {
      res.send({ code: 500, message: 'User not Found❌' })
    }



    //THE NODE MAILER:

    let testAccount = await nodemailer.createTestAccount()

    let transporter = nodemailer.createTransport({

      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass 
      }
    })


    let info = await transporter.sendMail({

      from: 'rajeshlakshmik@gmail.com', 
      to: req.body.email, 
      subject: 'OTP', 
      text: String(_otp), 
      html: '<b>Hello world?</b>' 
    })


    if (info.messageId) {
      Users.updateOne({ email: req.body.email }, { otp: _otp })
        .then(result => {
          res.send({ code: 200, message: 'OTP send👍🏼', otp: _otp })
        })

        .catch(err => {
          res.send({ code: 500, message: 'Server error🚫' })
        })

    } 
    else {
      res.send({ code: 500, message: 'Server error🚫' })
    }
  } 
  catch (err) {

    res.status(500).send({
      message: 'Internal Server Error🚫'
    })
  }
})



// TO SUBMIT THE OTP:

router.post('/submit-otp', async (req, res) => {

  try {
    const payload = req.body
    
    payload.hashedPassword = await bcrypt.hash(payload.password, 10)
    delete payload.password

    Users.findOne({ otp: payload.otp })

      .then(result => {

        Users.updateOne(
          { email: result.email },
          { hashedPassword: payload.hashedPassword }
        )

          .then(result => {
            res.send({ code: 200, message: 'Password Updated Successfully👍🏼' })
          })

          .catch(err => {
            res.send({ code: 500, message: 'Server error🚫' })
          })
      })

      .catch(error => {
        res.send({ code: 500, message: 'OTP is wrong❌' })
      })

  }
   catch (err) {

    res.status(500).send({
      message: 'Internal Server Error🚫'
    })
  }
})



// TO SIGNOUT:

router.get('/signout', async (req, res) => {
  await res.clearCookie('entryToken⌨️')

  return res.status(200).send({
    message: 'Successfully Signed out👍🏼'
  })
})

module.exports = router
