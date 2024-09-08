const express = require('express')
const app = express()
const port = 5000
const sequelize = require("./config/db")
const userModel = require("./user/model/userModel")
const cors = require('cors')

app.use(cors())

sequelize.sync().then(()=> console.log("db is ready"));
app.use(express.json());


app.use("/user", require("./user/route/userRoute"))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


