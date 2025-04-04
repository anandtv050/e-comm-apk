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
      console.log("userCart",userCart);
       
      if (userCart) {
        if (!userCart.products) {
          userCart.products = [];
        }
        let productExist=  userCart.products.findIndex(p => p.item.toString() === productId.toString())
        console.log("productExist",productExist);
        
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
            }
          ])
          .toArray();
          console.log("cartItems from user helpers 119",cartItems[0].products);
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
      console.log("cart",cart);
      
      if(cart){
        CartCount = cart.products.length;
      }
      resolve(CartCount)
    });
  },
};
