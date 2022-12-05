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

// app.listen(process.env.PORT || 3000, () => {//
//   console.log(`Example app listening at http://localhost:${port}`);
// });

mongoose.connect(
    process.env.MONGODB_URI
  )
  .then(() => console.log("db connected"));

module.exports = app;
module.exports.handler=serverless(app)