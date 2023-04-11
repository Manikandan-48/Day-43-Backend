const mongoose = require('mongoose')
mongoose.set('strictQuery', true)

exports.db = () => {

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

      console.log('MongoDB is connected...🎄')
    })

    .catch(err => {
      console.log(err)
    })
}
