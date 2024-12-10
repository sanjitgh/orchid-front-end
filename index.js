const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middelware
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ph10.ehebq.mongodb.net/?retryWrites=true&w=majority&appName=ph10`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const movieCollection = client.db("movieDB").collection("movies");
    const userCollection = client.db("movieDB").collection("users");
    const favoriteMovieCollection = client.db("movieDB").collection("favoritemovie")

    // create movie in db
    app.post('/movies', async (req, res) => {
      const movies = req.body;
      const result = await movieCollection.insertOne(movies);
      res.send(result);
    })

    // create favorite movie in db
    app.post("/favoritemovie", async (req, res) => {
      const movie = req.body;
      const result = await favoriteMovieCollection.insertOne(movie);
      res.send(result);
    })


    // read favorite movie from db
    app.get("/favoritemovie/:email", async (req, res) => {
      const query = { currentUserEmail: req.params.email }
      const result = await favoriteMovieCollection.find(query).toArray();
      res.send(result);
    })

    //create user in db
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    // read movie from db
    app.get("/movies", async (req, res) => {
      const { searchParams } = req.query;

      let option = {};

      if (searchParams) {
        option = { title: { $regex: searchParams, $options: "i" } }
      }

      const result = await movieCollection.find(option).toArray();
      res.send(result);
    })

    //read one specific data
    app.get('/movies/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const movie = await movieCollection.findOne(query);
      res.send(movie)
    })

    // update data 
    app.patch("/movies/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          image: data?.image,
          title: data?.title,
          genre: data?.genre,
          duration: data?.duration,
          year: data?.year,
          rating: data?.rating,
          summery: data?.summery,
        }
      }
      const result = await movieCollection.updateOne(query, update);
      res.send(result)
    })

    // delete single data form db
    app.delete('/movies/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const movie = await movieCollection.deleteOne(query);
      res.send(movie);
    })

    // delete favorite single data form db
    app.delete('/favoritemovie/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const movie = await favoriteMovieCollection.deleteOne(query);
      res.send(movie);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// root view on server is run
app.get("/", (req, res) => {
  res.send("Server is runing")
})

app.listen(port, () => {
  console.log(`Server is runing on port: ${port}`);
})