const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

//middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
// app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b8fibtq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    app.post('/jwt', async(req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})

      res
      .cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'none'
      })
      .send({success: true});
    })  

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('tech-talks blog server is running.')
})

app.listen(port, ()=>{
    console.log(`server is running at port ${port}`);
})