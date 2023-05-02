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
userCollection = database.collection("User");
addressCollection = database.collection("Address");
blogCollection = database.collection("Blog");
adminCollection = database.collection("Admin");


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

app.put("/users",cors(),async(req,res)=>{
    const userCollection=database.collection("User");

    //update json product into database
    await userCollection.updateOne(
        {_id:new ObjectId(req.body._id)},//condition for update
        { $set: { //Field for updating
            name: req.body.name,
            email:req.body.email,
            dob:req.body.dob,
            phoneNumber:req.body.phoneNumber,
            gender:req.body.gender,
            }
        }
    )
    var o_id = new ObjectId(req.body._id);
    const result = await userCollection.find({_id:o_id}).toArray();
    res.send(result[0])
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
    const result = await  userCollection.find({_id:o_id}).toArray();
    res.send(req.body)
})




app.post("/address/:id", cors(), async (req, res) => {
    var o_id = new ObjectId(req.params["id"]);
    const address = req.body;

    const addressCollection = database.collection("Address");
    const userCollection=database.collection("User");

    const insertedAddress = await addressCollection.insertOne(address);
    const insertedAddressId = insertedAddress.insertedId;
  
    // Thêm _id của Address vào mảng Address[] trong User
    const user = await userCollection.findOne({ _id: o_id });
  
    if (user) {
      user.Address.push(insertedAddressId);
      await userCollection.updateOne({ _id: o_id }, { $set: { Address: user.Address } });
    }
  
    res.send(user.Address);
});
app.get("/address/:id", cors(), async (req, res) => {
    var o_id = new ObjectId(req.params["id"]);

    userCollection = database.collection("User");

    // Lấy người dùng dựa trên userId
    const user = await userCollection.findOne({ _id: o_id });

    if (user) {
        const addressIds = user.Address; // Lấy mảng addressIds từ user
        addressCollection = database.collection("Address");

        // Lấy toàn bộ địa chỉ dựa trên mảng addressIds
        const addresses = await addressCollection.find({ _id: { $in: addressIds } }).toArray();

        res.send(addresses);
    } else {
        res.status(404).send("User not found");
    }
}); 


app.delete("/address/:id/:addressId", cors(), async (req, res) => {
    const o_id = new ObjectId(req.params["id"]);
    const addressId = new ObjectId(req.params["addressId"]);
  

    // Xóa địa chỉ từ bộ sưu tập Address
    // await addressCollection.deleteOne({ _id: addressId });
  
    // Xóa địa chỉ từ mảng Address trong User
    await userCollection.updateOne({ _id: o_id }, { $pull: { Address: addressId } });
  
    res.send("Address deleted successfully");
});


app.get("/address/setDefault/:id/:addressId", cors(), async (req, res) => {
    const o_id = new ObjectId(req.params["id"]);
    const addressId = new ObjectId(req.params["addressId"]);

    const user = await userCollection.findOne({ _id: o_id });
    const addressIds = user.Address;

    await addressCollection.updateMany({ _id: { $in: addressIds } }, { $set: { IsDefault: false } });

    await addressCollection.updateOne({ _id: addressId }, { $set: { IsDefault: true } });

  res.send("Address change successfully");
}); 



app.post("/confirmPass", cors(), async (req, res) => {
    // const userID = req.body.userID;
    const password = req.body.password;
    const userID  = new ObjectId(req.body.userID);
    const crypto = require('crypto');
    userCollection = database.collection("User");
    const user = await userCollection.findOne({_id: userID});

    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
    if (user.password === hash) {
        res.send(true);
    } else {
        res.send(false);
    }    
    
});


app.put("/changePass", cors(), async (req, res) => {
    // const userID = req.body.userID;
    const password = req.body.password;
    const userID  = new ObjectId(req.body.userID);
    var crypto = require('crypto');
    salt=crypto.randomBytes(16).toString('hex');
    hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    await userCollection.updateOne(
        {_id: userID},
        {$set:{
            password: hash,
            salt: salt
        }}
        );
    user=userCollection.findOne({_id: userID})
    res.send(user)

});

// BLog

app.get("/blogs",cors(),async (req,res)=>{
    const result = await blogCollection.find({}).toArray();
    res.send(result)
}
)

app.get("/blogs/:id",cors(),async (req,res)=>{
    var o_id = new ObjectId(req.params["id"]);
    const result = await blogCollection.find({_id:o_id}).toArray();
    res.send(result[0])
}
)

app.post("/blogs",cors(),async(req,res)=>{
    //put json BLog into database
    await blogCollection.insertOne(req.body)
    //send message to client(send all database to client)
    res.send(req.body)
})

app.put("/blogs",cors(),async(req,res)=>{
    //update json BLog into database
    await blogCollection.updateOne(
        {_id:new ObjectId(req.body._id)},//condition for update
        { $set: { //Field for updating
            title:req.body.title,
           img:req.body.img,
           category:req.body.category,
           tag:req.body.tag,
           author:req.body.author,
           description:req.body.description,
           displayDate:req.body.displayDate,
            }
        }
    )
    //send BLog after updating
    var o_id = new ObjectId(req.body._id);
    const result = await blogCollection.find({_id:o_id}).toArray();
    res.send(result[0])
})

app.delete("/blogs/:id",cors(),async(req,res)=>{
    var o_id = new ObjectId(req.params["id"]);
    const result = await blogCollection.find({_id:o_id}).toArray();
    await blogCollection.deleteOne(
    {_id:o_id}
    )
    res.send(result[0])
})


//đăng nhâp admin
app.post("/adminlogin", cors(), async (req, res) => {
    const adminname = req.body.adminname;
    const password = req.body.password;

    const crypto = require('crypto');
    const adminCollection = database.collection("Admin");

    const admin = await adminCollection.findOne({adminname: adminname});

    if (admin == null) {
        res.send({"adminname": adminname, "message": "not exist"});
    } else {
        const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
        if (admin.password === hash) {
            res.send(user);
        } else {
            res.send({"adminname": adminname, "password": password, "message": "wrong password"});
        }
    }
});