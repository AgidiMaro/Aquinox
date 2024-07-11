// src/index.ts
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import * as dotenv from "dotenv";


import { User } from './models/api/user';
import { UserModel } from './models/databases/user';

// const UserSchema = require('./models/databases/user');

const app = express();
dotenv.config();
const port = 8080;

mongoose.connect(process.env.MONGODB_URI as string)
     .then(() => console.log('Successfully connected to database'))
     .catch(err => console.log(err));

     app.use(bodyParser.urlencoded({
      extended: true
  }));


app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, TypeScript with Express!');
});

app.post('/user/createUser', async (req, res) => {
  const user: User = req.body;

  const newUser = new UserModel({
    ...user
  })

  const result = await newUser.save();
  res.json(result);
});


app.post('/user/signin', async (req, res) => {
  const user: User = req.body;

  console.log(user);

  try {
    const dbuser = await UserModel.findOne({email: user.email});

    console.log('   ' + dbuser);
    if (dbuser && dbuser.password === user.password) {
      res.send("Sucesss");
    } else {
      res.status(401).send("Failure");
    }
  } catch (err) {
    res.status(500).send({err});
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});