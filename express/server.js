const express = require("express");
const app = express();
const serverless=require("serverless-http")
const port = 8081;
const mongoose = require("mongoose");
const contact = require("../datamodel/contacts");
const bodyParser = require("body-parser");
const routes = require("../routes/userRoutes");
const contactrouter = express.Router();
const {API_ROOT}=require("../config")
app.use(API_ROOT,routes);
require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(API_ROOT,contactrouter)

const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

contactrouter.get("/",(req,res)=>{
  console.log("conncteding g    ==>")
  res.send("hi da")
})

contactrouter.post("/contacts", async (req, res) => {
  let updated = req.body.data;
  let id = req.body.userId;
  for (let i = 0; i < updated.length; i++) {
    let objUpdate = updated[i];
    objUpdate.UserId = id;
    updated[i] = objUpdate;
  }
  await contact.insertMany(updated, function (err, datas) {
    if (err) {
      console.log(err);
    }
    res.send(JSON.stringify({ message: "sucessfully saved", data: datas }));
  });
});

contactrouter.get("/contacts/:id", async (req, res) => {
  let paramId = req.params["id"];
  const strid = paramId.valueOf();
  await contact
    .find({ UserId: strid }, function (err, datas) {
      if (err) {
        console.log(err);
      }
      res.send(JSON.stringify({ message: "sucessfully saved", data: datas }));
    }).clone();
});

contactrouter.delete("/contacts", async (req, res) => {
  let deleteIdArray = req.body;
  deleteIdArray = deleteIdArray.map((x) => mongoose.Types.ObjectId(x));
  await contact
    .deleteMany({ _id: { $in: deleteIdArray } }, function (err, delCount) {
      if (err) {
        console.log(err);
      }
      res.send(
        JSON.stringify({ message: "sucessfully deletes", data: delCount })
      );
    }).clone();
});

//this is now i used for postman deleteall ...
contactrouter.delete("/emptycontacts", async (req, res) => {
  //temporary api call for delete // by putting if req.body,we can make one api call for delete and delerte all..
  await contact
    .deleteMany({}, function (err, delCount) {
      if (err) {
        console.log(err);
      }
      res.send(
        JSON.stringify({ message: "sucessfully deleted all", data: delCount })
      );
    }).clone();
});

// //approach 4
// const mongodb = require("mongodb")

// exports.handler = async function (event, context) {
//   const client = await mongodb.connect(process.env.MONGODB_URI, { useUnifiedTopology: true })
//   client.db().then(()=>console.log("DB connected"))
// }
// app.listen(port, () => {//
//   console.log(`Example app listening at http://localhost:${port}`);
// });
// console.log("here", process.env.MONGODB_URI)
//Approach 1
mongoose.connect(
    process.env.MONGODB_URI)
  .then(() => console.log("db connected"));



/*
Approch 3
const connectDb = async (url) => {
//  console.log(url, 'url to mongo atlas, connectDb');
  await mongoose.connect(url);
 };
 connectDb(process.env.MONGODB_URI)
//  console.log(mongoose.connection.readyState, 'Ready state email');
*/

/*
//Approach 2
let conn = null;
// const uri = 'YOUR CONNECTION STRING HERE';

// exports.connect = async function() {
//   console.log("hi")

//   if (conn == null) {
//     conn = mongoose.connect(process.env.MONGODB_URI, {
//       serverSelectionTimeoutMS: 5000
//     }).then(() => mongoose).then(() => console.log("db connected"));
    
//     // `await`ing connection after assigning to the `conn` variable
//     // to avoid multiple function calls creating new connections
//     await conn;
//   }

//   return conn;
// };
// connect()
*/
module.exports = app;
// module.exports.handler=serverless(app)


const handler = serverless(app);
module.exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};