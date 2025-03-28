const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db");
const router = require("./routes/router");
const cors=require("cors")
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

const PORT = process.env.PORT;


// Middleware
app.use(cors());

app.use(bodyParser.json());
app.use('/api', router);

connectDB();

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});
