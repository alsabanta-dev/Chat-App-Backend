const app = require('./app.js')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: './config.env' });

// DATABASAE
const DB = process.env.DB_LOCAL
mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

const port = 3000
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})