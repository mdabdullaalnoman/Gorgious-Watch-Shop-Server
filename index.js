const express = require('express');
const app = express();
const { MongoClient } = require("mongodb");
const cors = require('cors');
const objectId = require('mongodb').ObjectId;
const { application } = require('express');
require('dotenv').config();


//Middle were ------------------------------------------
app.use(cors());
app.use(express.json());

//Port---------------------------------------------------
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ne473.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        // Connect the client to the server
        await client.connect();

        const database = client.db("gorgeous_watch_shop");
        const watchesCollection = database.collection("watches");
        const parchesCollection = database.collection("parches");
        const reviewCollection = database.collection("review");
        const userCollection = database.collection("users");

        // get all watches info -------------------------------------
        app.get('/watches', async (req, res) => {
            const data = watchesCollection.find({});
            const watchesData = await data.toArray();
            res.json(watchesData);
        });

        // post watches data ------------------------------------------
        app.post('/watches', async (req, res) => {
            const watchData = req.body;
            const result = await watchesCollection.insertOne(watchData);
            res.json(result);
          });

        // post parches data ----------------------------------------
        app.post('/parches', async (req, res) => {
            const parchesData = req.body;
            const result = await parchesCollection.insertOne(parchesData);
            res.json(result);
        });

        // get parches data -----------------------------------------
        app.get('/parches', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const parchesData = parchesCollection.find(query);
            const result = await parchesData.toArray();
            res.send(result);
        });

        // delete my order watch products --------------------------
        app.delete('/parches/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) };
            const result = await parchesCollection.deleteOne(query);
            res.send(result);
        });

        // post review info --------------------------------------
        app.post('/review', async (req, res) => {
            const Review = req.body;
            const result = await reviewCollection.insertOne(Review);
            res.json(result);
        });
        // get review info-----------------------------------------
        app.get('/review', async (req, res) => {
            const reviewData = reviewCollection.find({});
            const result = await reviewData.toArray();
            res.json(result);
        });

        // save user registration data on mongo db data base---------------------------------
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        });
        // user upsert(if user already exits dont save user info other wise data will be saved)=================
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: user };
            const options = { upsert: true };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // make admin -----------------------------
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // check is make admin email is admin or not -------------------------------

        app.get('/users/:email' , async(req , res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});

        })



        console.log('data base connected reconected data');



    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




//test get -----------------------------------------------
app.get('/', (req, res) => {
    res.send('connected');
})
// listening port -----------------------------------------
app.listen(port, () => {
    console.log('listening port', port);
});