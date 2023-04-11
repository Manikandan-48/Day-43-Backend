require('dotenv').config()
const express = require('express')

const cors = require('cors')
const app = express()

const { db } = require('./connection')
const authRoutes = require('./Routes/auth')

const quoteRoutes = require('./Routes/quotes')
const { requireSignIn, isAuth } = require('./Utils/authorization')


//THE MIDDLEWARES:

db()
app.use(cors())

app.use(express.json())
app.get('/', (req, res) => {

    res.send('Hey, Everything is working fine✨🎏')
})



//THE CUSTOM MIDDLEWARE:

app.use('/api', authRoutes)
app.use('/api', requireSignIn, isAuth, quoteRoutes)

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {

    console.log(`The app is Running Successfully in port ${PORT}🎇🎈`)
})
