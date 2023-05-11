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
couponCollection = database.collection("Coupon");
promotionCollection = database.collection("Promotion");
// database = client.db("FashionData");
// productCollection = database.collection("test");
userCollection = database.collection("User");
addressCollection = database.collection("Address");
orderCollection=database.collection("Order")
blogCollection = database.collection("Blog");
adminCollection = database.collection("Admin");
evaluateCollection= database.collection("Evaluate");




// --------------Promotion -----------------
app.get("/promotions",cors(),async (req,res)=>{
    const result = await promotionCollection.find({}).sort({ cDate: -1 }).toArray();
    res.send(result)
    }
    )

    app.get("/ActivatePromotionsProduct", cors(), async (req, res) => {
        const products = await productCollection.find({}).sort({ cDate: -1 }).toArray();
        const promotions = await promotionCollection.find({}).sort({ cDate: -1 }).toArray();
        const today = new Date();
        let finalPromotion;
      
        const filteredPromotions = promotions.filter(
          (promotion) =>
            new Date(promotion.Ngaybatdau) <= today &&
            new Date(promotion.Ngayketthuc) > today
        );
      
        if (filteredPromotions.length > 0) {
          finalPromotion = filteredPromotions[0];
        } else {
          const futurePromotions = promotions.filter(
            (promotion) => new Date(promotion.Ngaybatdau) > today
          );
          const sortedPromotions = futurePromotions.sort(
            (a, b) => new Date(a.Ngaybatdau).getTime() - new Date(b.Ngaybatdau).getTime()
          );
          finalPromotion = sortedPromotions[0];
        }
      
        // const productsWithDiscount = products.map((product) => {
        //   if (finalPromotion && finalPromotion.SanphamApdung && finalPromotion.SanphamApdung.includes(product._id.toString())) {
        //     product.Discount = finalPromotion.Gia;
        //   }
        //   return product;
        // });
        const productsWithDiscount = products.filter((product) => {
            if (finalPromotion && finalPromotion.SanphamApdung && finalPromotion.SanphamApdung.includes(product._id.toString())) {
              product.Discount = finalPromotion.Gia;
              return true; // Giữ lại sản phẩm trong mảng
            }
            return false; // Loại bỏ sản phẩm khỏi mảng
          });
      
        // res.send(finalPromotion)
        res.send(productsWithDiscount);
      });
    // app.get("/ActivatePromotionsProduct", cors(), async (req, res) => {
    //     const products = await productCollection.find({}).sort({ cDate: -1 }).toArray();
    //     const promotions = await promotionCollection.find({}).sort({ cDate: -1 }).toArray();
    //     const today = new Date();
      
    //     const productsWithDiscount = products.filter((product) => {
    //       const productPromotion = promotions.find(
    //         (promotion) =>
    //           promotion.SanphamApdung &&
    //           promotion.SanphamApdung.includes(product._id.toString()) &&
    //           new Date(promotion.Ngaybatdau) <= today &&
    //           new Date(promotion.Ngayketthuc) > today
    //       );
      
    //       if (productPromotion) {
    //         product.Discount = productPromotion.Gia;
    //         return true;
    //       }
    //       return false;
    //     });
      
    //     res.send(productsWithDiscount);
    //   });
    
      app.get("/ActivatePromotions", cors(), async (req, res) => {
        // const products = await productCollection.find({}).sort({ cDate: -1 }).toArray();
        const promotions = await promotionCollection.find({}).sort({ cDate: -1 }).toArray();
        const today = new Date();
        let finalPromotion;
    
        const filteredPromotions = promotions.filter(
          (promotion) =>
            new Date(promotion.Ngaybatdau) <= today &&
            new Date(promotion.Ngayketthuc) > today
        );
      
        if (filteredPromotions.length > 0) {
          finalPromotion = filteredPromotions[0];
        } else {
          const futurePromotions = promotions.filter(
            (promotion) => new Date(promotion.Ngaybatdau) > today
          );
          const sortedPromotions = futurePromotions.sort(
            (a, b) => new Date(a.Ngaybatdau).getTime() - new Date(b.Ngaybatdau).getTime()
          );
          finalPromotion = sortedPromotions[0];
        }
      
      
        res.send(finalPromotion)
      });

    app.get("/promotions/:id",cors(),async (req,res)=>{
        var o_id = new ObjectId(req.params["id"]);
        const result = await promotionCollection.find({_id:o_id}).toArray();
        res.send(result[0])
    }
    )
    app.get("/promotions_product/:id",cors(),async (req,res)=>{
        var o_id = (req.params["id"]);
        const result = await productCollection.find({Discount:o_id}).toArray();
        res.send(result[0])
    }
    )
    app.post("/promotions",cors(),async(req,res)=>{
        const insertedPromotion= await promotionCollection.insertOne(req.body)
        res.send(insertedPromotion)
    })


    app.put("/promotions",cors(),async(req,res)=>{
        //update json product into database
        const promotion=req.body
        await promotionCollection.updateOne(
            {_id:new ObjectId(promotion._id)},//condition for update
            { $set: { //Field for updating
               TenPromotion:promotion.TenPromotion,
               Hinhanh:promotion.Hinhanh,
               SanphamApdung:promotion.SanphamApdung,
               LoaiPromotion:promotion.LoaiPromotion,
               Mota:promotion.Mota,
                Ngaybatdau:promotion.Ngaybatdau,
                Ngayketthuc:promotion.Ngayketthuc,
                Gia:promotion.Gia,
                // Soluong:promotion.Soluong,
                cDate:promotion.cDate,
                }
            }
        )
        var o_id = new ObjectId(promotion._id);
        const result = await promotionCollection.find({_id:o_id}).toArray();
        res.send(result[0])
    })

    app.put("/promotions_product",cors(),async(req,res)=>{
        //update json product into database
        await promotionCollection.updateOne(
            {_id:new ObjectId(req.body._id)},//condition for update
            { $set: { //Field for updating

                Discount:req.body.Discount,
                cDate:req.body.cDate,
                }
            }
        )
        var o_id = new ObjectId(req.body._id);
        const result = await promotionCollection.find({_id:o_id}).toArray();
        res.send(result[0])
    })


    app.delete("/promotions/:id",cors(),async(req,res)=>{
        var o_id = new ObjectId(req.params["id"]);
        const result = await promotionCollection.find({_id:o_id}).toArray();
        await promotionCollection.deleteOne(
            {_id:o_id}
        )
        res.send(result[0])
    })




// --------------Coupon-----------------

app.get("/coupons",cors(),async (req,res)=>{
    const result = await couponCollection.find({}).sort({ cDate: -1 }).toArray();
    res.send(result)
    }
    )

    app.get("/coupons/:id",cors(),async (req,res)=>{
        var o_id = new ObjectId(req.params["id"]);
        const result = await couponCollection.find({_id:o_id}).toArray();
        res.send(result[0])
    }
    )
    app.post("/coupons",cors(),async(req,res)=>{
        //put json product into database
        await couponCollection.insertOne(req.body)
        //send message to client(send all database to client)
        res.send(req.body)
    })


    app.put("/coupons",cors(),async(req,res)=>{
        //update json product into database
        await couponCollection.updateOne(
            {_id:new ObjectId(req.body._id)},//condition for update
            { $set: { //Field for updating
                TenCoupon:req.body.TenCoupon,
                Hinhanh:req.body.Hinhanh,
               Noidung:req.body.Noidung,
              Giatrigiam:req.body.Giatrigiam,
             Soluong:req.body.Soluong,
            Dieukiengiam:req.body.Dieukiengiam,
               Ngaybatdau:req.body.Ngaybatdau,
               Ngayketthuc:req.body.Ngayketthuc,
                cDate:req.body.cDate,
                }
            }
        )
        var o_id = new ObjectId(req.body._id);
        const result = await couponCollection.find({_id:o_id}).toArray();
        res.send(result[0])
    })

    app.delete("/coupons/:id",cors(),async(req,res)=>{
        var o_id = new ObjectId(req.params["id"]);
        const result = await couponCollection.find({_id:o_id}).toArray();
        await couponCollection.deleteOne(
            {_id:o_id}
        )
        res.send(result[0])
    })
    app.get("/user_coupon/:id", cors(), async (req, res) => {
        const userId = new ObjectId(req.params["id"]);
      
        userCollection = database.collection("User");
      
        // Lấy người dùng dựa trên userId
        const user = await userCollection.findOne({ _id: userId });
      
        const couponIds = user.discount.map(discount => new ObjectId(discount.DiscountID));
        // Lấy toàn bộ coupon có IsActive=true dựa trên mảng couponIds
        const coupons = await couponCollection.find({ _id: { $in: couponIds } }).toArray();
      
        res.send(coupons);
      });

    

// ----------product --------------
// app.get("/products", async (req, res) => {
//     const products = await productCollection.find({}).sort({ cDate: -1 }).toArray();
//     const promotions = await promotionCollection.find({}).sort({ cDate: -1 }).toArray();
//     const today = new Date();
//     const filteredPromotions =  promotions
//     .filter((promotion) => new Date(promotion.Ngaybatdau) <= today && new Date(promotion.Ngayketthuc) >= today)
//     const productsWithDiscount=products
//     let finalPromotion =filteredPromotions
//     if (filteredPromotions.length > 0) {
//         finalPromotion =filteredPromotions
//         productsWithDiscount = products.map((product) => {
//             if (finalPromotion && finalPromotion.SanphamApdung.includes(product._id.toString())) {
//               product.Discount = finalPromotion.Gia;
//             }
//             return product;
//           }); 
//     } 

//     res.send(productsWithDiscount);
//     // res.send(filteredPromotions)
//   });
app.get("/products", async (req, res) => {
    const products = await productCollection.find({}).sort({ cDate: -1 }).toArray();
    const promotions = await promotionCollection.find({}).sort({ cDate: -1 }).toArray();
    const today = new Date();
    const filteredPromotions = promotions.filter((promotion) => new Date(promotion.Ngaybatdau) <= today && new Date(promotion.Ngayketthuc) >= today);
    let finalPromotion = filteredPromotions.length > 0 ? filteredPromotions[0] : null;
    const productsWithDiscount = products.map((product) => {
      if (finalPromotion && finalPromotion.SanphamApdung && finalPromotion.SanphamApdung.includes(product._id.toString())) {
        product.Discount = finalPromotion.Gia;
      }
      return product;
    });
  
    res.send(productsWithDiscount);
  });

app.get("/products/:id",cors(),async (req,res)=>{
    const products = await productCollection.find({}).sort({ cDate: -1 }).toArray();
    const promotions = await promotionCollection.find({}).sort({ cDate: -1 }).toArray();
    const today = new Date();
    const filteredPromotions = promotions.filter((promotion) => new Date(promotion.Ngaybatdau) <= today && new Date(promotion.Ngayketthuc) >= today);
    let finalPromotion = filteredPromotions.length > 0 ? filteredPromotions[0] : null;
    const productsWithDiscount = products.map((product) => {
      if (finalPromotion && finalPromotion.SanphamApdung && finalPromotion.SanphamApdung.includes(product._id.toString())) {
        product.Discount = finalPromotion.Gia;
      }
      return product;
    });
    var o_id = new ObjectId(req.params["id"]);
    const result = productsWithDiscount.filter((product) => product._id.toString() === o_id.toString());
    res.send(result[0]);
}
)

app.put("/products",cors(),async(req,res)=>{
    //update json product into database
    await productCollection.updateOne(
        {_id:new ObjectId(req.body._id)},//condition for update
        { $set: { //Field for updating
           TenSP:req.body.TenSP,
           Hinhanh:req.body.Hinhanh,
           LoaiSP:req.body.LoaiSP,
          Hang:req.body.Hang,
          Price:req.body.Price,
          ClickCounter:req.body.ClickCounter,
         Mota:req.body.Mota ,
         Soluong:req.body.Soluong,
           Ngaybatdau:req.body.Ngaybatdau,
           Ngayketthuc:req.body.Ngayketthuc,
            cDate:req.body.cDate,
            }
        }
    )
    var o_id = new ObjectId(req.body._id);
    const result = await couponCollection.find({_id:o_id}).toArray();
    res.send(result[0])
})
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
            discount:req.body.discount,
            }
        }
    )
    var o_id = new ObjectId(req.body._id);
    const result = await userCollection.find({_id:o_id}).toArray();
    res.send(result[0])
})
//lấy danh sách khách hàng
userCollection = database.collection("User");
app.get("/users",cors(),async (req,res)=>{
  const result = await userCollection.find({}).toArray();
  res.send(result)})

//lấy customer detail
app.get("/users/:id",cors(),async (req,res)=>{
var o_id = new ObjectId(req.params["id"]);
const result = await userCollection.find({_id:o_id}).toArray();
res.send(result[0])
}
)

//vô hiệu hóa Customer
app.put("/users/:id",cors(),async(req,res)=>{
  //update json product into database
  userCollection=database.collection("User");
  var o_id = new ObjectId(req.params["id"]);
  await userCollection.updateOne(
      {_id:o_id},//condition for update
      { $set: { //Field for updating
          UserStatus:req.body.UserStatus
          }
      }
  )
  //send Fahsion after updating
  // var o_id = new ObjectId(req.body._id);
  const result = await  userCollection.find({}).toArray();
  res.send(result)
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
    var o_id = new ObjectId(req.params["id"]);
    await userCollection.updateOne(
        {_id:o_id},//condition for update
        { $set: { //Field for updating
            cart:req.body
            }
        }
    )
    const result = await  userCollection.find({_id:o_id}).toArray();
    res.send(result)
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

    const addressIds = user.Address; // Lấy mảng addressIds từ user
    addressCollection = database.collection("Address");

        // Lấy toàn bộ địa chỉ dựa trên mảng addressIds
    const addresses = await addressCollection.find({ _id: { $in: addressIds } }).toArray();

    res.send(addresses);
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


app.get("/order_user/:id", async (req, res) => {
    var o_id = (req.params["id"]);
    const result = await orderCollection.find({userId:o_id}).sort({ cDate: -1 }).toArray();
    res.send(result);
});

app.post("/order",cors(),async(req,res)=>{
    //put json product into database
    await orderCollection.insertOne(req.body)
    //send message to client(send all database to client)
    res.send(req.body)
})
// BLog

app.get("/blogs",cors(),async (req,res)=>{
    const result = await blogCollection.find({}).sort({ cDate: -1 }).toArray();
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

// lấy danh sách admin

app.get("/admins",cors(),async (req,res)=>{
  const result = await adminCollection.find({}).toArray();
  res.send(result)
  }
  )

//lấy admin detail
app.get("/admins/:id",cors(),async (req,res)=>{
  var o_id = new ObjectId(req.params["id"]);
  const result = await adminCollection.find({_id:o_id}).toArray();
  res.send(result[0])
  }
  )

//đăng nhâp admin


app.get("/admin_order", async (req, res) => {
    const result = await orderCollection.find({}).sort({ cDate: -1 }).toArray();
    res.send(result);
});
app.get("/admin_order/:id",cors(),async (req,res)=>{
    var o_id = new ObjectId(req.params["id"]);
    const result = await orderCollection.find({_id:o_id}).toArray();
    res.send(result[0])
}
)
app.get("/admin_order_detail/:id", cors(), async (req, res) => {
    var o_id = new ObjectId(req.params["id"]);

    const order = await orderCollection.findOne({ _id: o_id });

    if (order) {
      let orderDetailIDs = order.orderItems.map((item) => new ObjectId(item.productID));

      // Lấy toàn bộ sản phẩm dựa trên mảng orderDetailIDs
      const orderDetailProduct = await productCollection.find({ _id: { $in: orderDetailIDs } }).toArray();

      res.send(orderDetailProduct );
    } else {
      res.status(404).send("Order not found");
    }
});

app.get("/admin_order_user/:id", cors(), async (req, res) => {
    var o_id = new ObjectId(req.params["id"]);

    const order = await orderCollection.findOne({ _id: o_id });

    let orderUserID =new ObjectId( order.userId)

    // Lấy toàn bộ sản phẩm dựa trên mảng orderDetailIDs
    const orderUser = await userCollection.find({ _id: orderUserID }).toArray();

    res.send(orderUser );

});
app.get("/admin_order_address/:id", cors(), async (req, res) => {
    var o_id = new ObjectId(req.params["id"]);

    const order = await orderCollection.findOne({ _id: o_id });

    let orderAdressID =new ObjectId( order.addressID)
    // let orderAdressID = order.addressID

    // Lấy toàn bộ sản phẩm dựa trên mảng orderDetailIDs
    const orderAddress = await addressCollection.find({ _id: orderAdressID }).toArray();

    res.send(orderAddress );

});

app.put("/admin_order_update",cors(),async(req,res)=>{
    // const userCollection=database.collection("User");

    //update json product into database
    await orderCollection.updateOne(
        {_id:new ObjectId(req.body._id)},//condition for update
        { $set: { //Field for updating
            status: req.body.status,
            ShipByDate: req.body.ShipByDate,
            DueDate: req.body.DueDate,
            }
        }
    )
    const result = await orderCollection.find({}).sort({ cDate: -1 }).toArray();
    res.send(result)
})


//tạo admin
app.post("/admins",cors(),async(req,res)=>{
    var crypto = require('crypto');
    salt=crypto.randomBytes(16).toString('hex');
    admin=req.body
    hash=crypto.pbkdf2Sync(admin.password, salt,1000,64, `sha512`).toString(`hex`);
    admin.password=hash
    admin.salt=salt
    await adminCollection.insertOne(admin)
    res.send(req.body)
})
//login admin
app.post("/loginAdmin", cors(), async (req, res) => {
    const Account_Name = req.body.adminname;
    const password = req.body.password;

    const crypto = require('crypto');

    const admin = await adminCollection.findOne({Account_Name: Account_Name});

    if (admin == null) {
        res.send({"Account_Name": Account_Name, "message": "not exist"});
    } else {
        const hash = crypto.pbkdf2Sync(password, admin.salt, 1000, 64, `sha512`).toString(`hex`);
        if (admin.password === hash) {
            res.send(admin);
        } else {
            res.send({"Account_Name": Account_Name, "password": password, "message": "wrong password"});
        }
    }
    // res.send(Account_Name)
});

// app.post("/adminlogin", cors(), async (req, res) => {
//     const adminname = req.body.adminname;
//     const password = req.body.password;

//     const crypto = require('crypto');
//     const adminCollection = database.collection("Admin");

//     const admin = await adminCollection.findOne({adminname: adminname});

//     if (admin == null) {
//         res.send({"adminname": adminname, "message": "not exist"});
//     } else {
//         const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
//         if (admin.password === hash) {
//             res.send(user);
//         } else {
//             res.send({"adminname": adminname, "password": password, "message": "wrong password"});
//         }
//     }
// });



    //vô hiệu hóa Admin
app.put("/admins/:id",cors(),async(req,res)=>{
      adminCollection=database.collection("Admin");
      var o_id = new ObjectId(req.params["id"]);
      await adminCollection.updateOne(
          {_id:o_id},//condition for update
          { $set: { //Field for updating
              AdminStatus:req.body.AdminStatus
              }
          }
      )
      const result = await  adminCollection.find({}).toArray();
      res.send(result)
    })

    app.put('/admin-update/:id', cors(), (req, res) => {
      const id = new ObjectId(req.params["id"]);
      const filter = { _id: id }

      adminCollection.updateOne(filter,
        {
          $set: {
          adminname: req.body.adminname,
          password: req.body.password,
          Phone: req.body.Phone,
          Gender: req.body.Gender,
          Image: req.body.Image,
          AccountName: req.body.AccountName,
          IsActive: req.body.IsActive,
          CreatedDate: req.body.CreatedDate,
          ModifiedDate: req.body.ModifiedDate,
          Permission: req.body.Permission,
          DOB: req.body.DOB,
          AdminStatus: req.body.AdminStatus,
          Email: req.body.Email,
          }
        }, function (err) {
          if (err) throw err
        })
        res.send('update successful')
      })

app.post("/productEvaluate",cors(),async(req,res)=>{
    //put json product into database
    await evaluateCollection.insertOne(req.body)
    //send message to client(send all database to client)
    res.send(req.body)
})

app.get("/productEvaluate/:id",cors(),async (req,res)=>{
    var o_id =req.params["id"];
    const result = await evaluateCollection.find({productId:o_id}).toArray();
    res.send(result)
}
)


