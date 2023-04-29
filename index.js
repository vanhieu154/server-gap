const express = require('express');
const app = express();
const port = 4000;
const morgan=require("morgan")
app.use(morgan("combined"))

const bodyParser=require("body-parser")
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));

const cors=require("cors");
app.use(cors())
app.listen(port,()=>{
console.log(`My Server listening on port ${port}`)
})
app.get("/",(req,res)=>{
res.send("This Web server is processed for MongoDB")
})
const { MongoClient, ObjectId } = require('mongodb');
client = new MongoClient("mongodb://127.0.0.1:27017");
client.connect();
database = client.db("GAP2002");
productCollection = database.collection("Product");
// database = client.db("FashionData");
// productCollection = database.collection("test");




app.get("/products", async (req, res) => {
    const result = await productCollection.find({}).sort({ cDate: -1 }).toArray();
    res.send(result);
  });
app.get("/product/:style", cors(), async (req, res) => {
    const style = req.params.style;
    const result = await productCollection.find({ style: style }).sort({ cDate: -1 }).toArray();
    res.send(result);
  });
    
app.get("/products/:id",cors(),async (req,res)=>{
    var o_id = new ObjectId(req.params["id"]);
    const result = await productCollection.find({_id:o_id}).toArray();
    res.send(result[0])
}
)

app.post("/products",cors(),async(req,res)=>{
    //put json product into database
    await productCollection.insertOne(req.body)
    //send message to client(send all database to client)
    res.send(req.body)
})

app.put("/products",cors(),async(req,res)=>{
    //update json product into database
    await productCollection.updateOne(
        {_id:new ObjectId(req.body._id)},//condition for update
        { $set: { //Field for updating
            style: req.body.style,
            product_subject:req.body.product_subject,
            product_detail:req.body.product_detail,
            product_image:req.body.product_image,
            cDate:req.body.cDate,
            }
        }
    )
    //send Fahsion after updating
    var o_id = new ObjectId(req.body._id);
    const result = await productCollection.find({_id:o_id}).toArray();
    res.send(result[0])
})

app.delete("/products/:id",cors(),async(req,res)=>{
    //find detail product with id
    var o_id = new ObjectId(req.params["id"]);
    const result = await productCollection.find({_id:o_id}).toArray();
    //update json product into database
    await productCollection.deleteOne(
        {_id:o_id}
    )
    //send Fahsion after remove
    res.send(result[0])
})

//đăng ký
app.post("/users",cors(),async(req,res)=>{
    var crypto = require('crypto');
    salt=crypto.randomBytes(16).toString('hex');

    //tạo thêm db User trên mongodb
    userCollection=database.collection("User");
    user=req.body

    hash=crypto.pbkdf2Sync(user.password, salt,1000,64, `sha512`).toString(`hex`);

    user.password=hash
    user.salt=salt

    await userCollection.insertOne(user)

    res.send(req.body)
})
//đăng nhâp
app.post("/login", cors(), async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const crypto = require('crypto');
    const userCollection = database.collection("User");

    const user = await userCollection.findOne({username: username});

    if (user == null) {
        res.send({"username": username, "message": "not exist"});
    } else {
        const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
        if (user.password === hash) {
            res.send(user);
        } else {
            res.send({"username": username, "password": password, "message": "wrong password"});
        }
    }
});

app.put("/cart/:id",cors(),async(req,res)=>{
    //update json product into database
    userCollection=database.collection("User");
    var o_id = new ObjectId(req.params["id"]);
    await userCollection.updateOne(
        {_id:o_id},//condition for update
        { $set: { //Field for updating
            cart:req.body
            }
        }
    )
    //send Fahsion after updating
    // var o_id = new ObjectId(req.body._id);
    const result = await  userCollection.find({_id:o_id}).toArray();
    res.send(req.body)
})

// app.put("/cart",cors(),async(req,res)=>{
//     //update json product into database
//     userCollection=database.collection("User");
//     await userCollection.updateOne(
//         {_id:new ObjectId(req.body._id)},//condition for update
//         { $set: { //Field for updating
//             cart:req.body.cart
//             }
//         }
//     )
//     //send Fahsion after updating
//     var o_id = new ObjectId(req.body._id);
//     const result = await  userCollection.find({_id:o_id}).toArray();
//     res.send(result[0])
// })

// app.post("/login",cors(),async(res,req)=>{
//     username = req.body.username;
//     password = req.body.password;

//     var crypto = require('crypto');

//     userCollection = database.collection("User")

//     var user = await userCollection.findOne({username: username})
//     if(user==null)
//         res.send({"username":username,"message":"not exist"})
//     else
//     {
//         hash = crypto.pbkdf2Sync(password,user.salt,1000,64,`sha512`).toString(`hex`);
//         if(user.password==hash){
//             res.send(user)
//         }else{
//             res.send({"username":username,"password":password,"message":"wrong password"})
//         }
//     }
// })




