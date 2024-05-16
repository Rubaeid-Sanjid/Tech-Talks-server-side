const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b8fibtq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const blogCollections = client
      .db("techBlogDB")
      .collection("blogCollections");
    const commentCollections = client
      .db("techBlogDB")
      .collection("commentCollections");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      const result = await blogCollections.insertOne(blog);
      res.send(result);
    });

    app.get("/blogs", async (req, res) => {
      const result = await blogCollections.find().toArray();
      res.send(result);
    });

    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollections.findOne(query);
      res.send(result);
    });

    app.post("/comments", async (req, res) => {
      const comment = req.body;
      const result = await commentCollections.insertOne(comment);
      res.send(result);
    });

    app.get("/comments", async (req, res) => {
      const result = await commentCollections.find().toArray();
      res.send(result);
    });

    app.get("/comments/:id", async (req, res) => {
      const curr_blog_id = req.params.id;
      const query = { blog_Id: curr_blog_id };
      const result = await commentCollections.find(query).toArray();
      res.send(result);
    });

    app.patch("/blogs/:id", async(req, res) => {
      const updated_blogInfo = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updated_blogInfoDoc = {
        $set: {
          title: updated_blogInfo.updated_title,
          image: updated_blogInfo.updated_image,
          category: updated_blogInfo.updated_category,
          short_description: updated_blogInfo.updated_short_description,
          long_description: updated_blogInfo.updated_long_description,
        },
      };
      const result = await blogCollections.updateOne(filter, updated_blogInfoDoc, option);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("tech-talks blog server is running.");
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
