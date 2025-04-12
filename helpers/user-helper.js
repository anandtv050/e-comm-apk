var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const { ObjectId, Collection } = require("mongodb"); // Make sure this is imported
const productHelpers = require("./product-helpers");
const { format } = require("morgan");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      const data = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData);
      resolve(data.insertedId);
    });
  },
  doLogin: (loginData) => {
    return new Promise(async (resolve, reject) => {
      const user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: loginData.email });
      if (user) {
        bcrypt.compare(loginData.Password, user.password).then((status) => {
          if (status) {
            console.log("login success");
            const response = {
              user: user,
              status: true,
            };
            resolve(response);
          } else {
            console.log("login failed password mimatching");
            resolve({ status: false });
          }
        });
      } else {
        console.log("auth failed");
        resolve({ status: false });
      }
      console.log(user);
    });
  },
  addToCart: (productId, UserId) => {

    return new Promise(async (resolve, reject) => {
      let proObj={
        item:new  ObjectId(productId),
        quantity:1
      }
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(UserId) });     
       
      if (userCart) {
        if (!userCart.products) {
          userCart.products = [];
        }
        let productExist=  userCart.products.findIndex(p => p.item.toString() === productId.toString())
        
        if(productExist!=-1){
          db.get().collection(collection.CART_COLLECTION).updateOne(
            { user: new ObjectId(UserId), "products.item": new ObjectId(productId) }, 
            { $inc: { "products.$.quantity": 1 } }
          )
          .then(()=>{
            resolve();
          })
        } else {     
          await db.get().collection(collection.CART_COLLECTION).updateOne(
            { user: new ObjectId(UserId) },
            { $push: { products: proObj } }
          ).then((response) => {
              resolve();
          });
        }
      } else {
        let objCart = {
          user: new ObjectId(UserId),
          products: [proObj],
        };
        await db
          .get()
          .collection(collection.CART_COLLECTION)
          .insertOne(objCart)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCarts: (UserId) => {
    return new Promise(async (resolve, reject) => {
      try {        
        console.log("UserId",UserId);
        let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([{
              $match: { user: new ObjectId(UserId) },
            },

            {
              $unwind:'$products'
            },
            {
              $project:{
                item:'$products.item',
                quantity :'$products.quantity'
              }
            },
            {
              $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'product'
              }
            },
            {
              $addFields: {
                product: { $arrayElemAt: ['$product', 0] },
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: 1,
              },
            },
          ]).toArray();
        resolve(cartItems);
      } catch (err) {
        console.error("Error in getCarts:", err);
        reject(err); // Reject the promise with an error if something goes wrong
      }
    });
  },
  getCartCount: (userId) => {
    return new Promise(async(resolve, reject) => {
      //check teh cart exist or not \
      let  CartCount = 0 ;
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user : new ObjectId(userId)})
      
      if(cart){
        CartCount = cart.products.length;
      }
      resolve(CartCount)
    });
  },
  changeProductQuantity:(details)=>{ 
    count = parseInt(details.count  )
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.CART_COLLECTION).updateOne(
        { _id: new ObjectId(details.cart), "products.item": new ObjectId(details.product) }, 
        { $inc: { "products.$.quantity": count } }
      )
      .then((response)=>{
        resolve(response);
      })
    })
  },
  getTotalAmount:(UserId)=>{
    return new Promise(async(resolve,reject)=>{
        let total = await db.get().collection(collection.CART_COLLECTION).aggregate([{
          $match: { user: new ObjectId(UserId) },
        },
    
        {
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item',
            quantity :'$products.quantity'
          }
        },
        {
          $lookup:{
            from:collection.PRODUCT_COLLECTION,
            localField:'item',
            foreignField:'_id',
            as:'product'
          }
        },
        {
          $addFields: {
            product: { $arrayElemAt: ['$product', 0] },
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: 1,
            productPrice: { $toDouble: "$product.Price" }
          }, 
        },
        {
          $group: {
            _id: null,
            total:{$sum:{$multiply:['$quantity','$productPrice']}}
          }
        }
      ]).toArray();      
      resolve(total[0].total || 0)
      
    })
  },
  placeOrders:(orderDetails,product,totalAmount,UserId)=> {
    return new Promise((resolve,reject)=> {
      let status = orderDetails.paymentMethod ==='cod'? 'placed' :'pending' ;
      let OrderObj = {
        deliveryDetails :{
          mobile:orderDetails.mobile,
          address:orderDetails.address,
          pincode:orderDetails.pincode
        },
        userId:new ObjectId(UserId),
        paymentMethod:orderDetails.paymentMethod,
        products:product,
        totalAmount:totalAmount,
        status:status,
        date:new Date()
      }

      db.get().collection(collection.ORDER_COLLECTION).insertOne(OrderObj).then((response)=>{
        db.get().collection(collection.CART_COLLECTION).deleteOne({user:new ObjectId(UserId)});
        resolve()
      })
    })
  },
  getCartProductList:(userID)=> {
    return new Promise(async(resolve,reject)=>{
      let Cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userID)})
      resolve(Cart.products);
    })
  },
  getAllUserOrders:(userId)=>{
    return new Promise(async (resolve,reject)=>{
      let userOrders = await db.get().collection(collection.ORDER_COLLECTION).find({userId: new ObjectId(userId)}).toArray()
      resolve(userOrders)
    })
  },
  getOrderProducts:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
      let OrderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match:{_id:new ObjectId(orderId)}
        },
        {
          $unwind :'$products'
        },
        {
          $project:{
            item:'$products.item',
            quantity:'$products.quantity'
          }
        },
        {
          $lookup:{
            from:collection.PRODUCT_COLLECTION,
            localField:'item',
            foreignField:'_id',
            as:'product'
          }
        },
        {
          $project:{
            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
          }
        }
      ]).toArray();
      resolve(OrderItems)
      
    })
  }
};
