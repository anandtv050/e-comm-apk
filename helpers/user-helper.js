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
      const data= await db.get().collection(collection.USER_COLLECTION).insertOne(userData);
      resolve(data.insertedId);
    });
  },
  doLogin: (loginData) => {
    return new Promise( async(resolve,reject)=>{
         const user=await db.get().collection(collection.USER_COLLECTION).findOne({email:loginData.email})
         if(user){
            bcrypt.compare(loginData.Password,user.password).then((status)=>{
                if(status) {
                    console.log("login success");   
                    const response = {
                        user: user,
                        status: true
                    }; 
                    resolve(response); 
                } else {
                    console.log("login failed password mimatching");
                    resolve({status:false})
                }
            })
         }else {
            console.log("auth failed");
            resolve({status:false})
            
         }
         console.log(user);
         
    })
    
  },
  addToCart:(productId,UserId)=>{
    return new Promise(async(resolve,reject)=>{
        let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: new ObjectId(UserId)})
        if(userCart){
          await db.get().collection(collection.CART_COLLECTION).updateOne({user:new ObjectId(UserId)},
          {
            $push:{products:new ObjectId(productId)}
          }).then((response)=>{
            resolve()
          })
        } else {
          let objCart ={
            user :new ObjectId(UserId),
            products : [new ObjectId(productId)]
          }          
         await db.get().collection(collection.CART_COLLECTION).insertOne(objCart).then((response)=>{
          resolve()
          })
        }
    })
  },
  getCarts: (UserId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: { user: new ObjectId(UserId) }
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,  // Ensure this is correct
              let: { proList: '$products' },  // 'products' is the array of ObjectIds in the CART_COLLECTION
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', "$$proList"]  // This checks if the product IDs match in 'proList'
                    }
                  }
                }
              ],
              as: 'cartItems'  // The output array with the matched products
            }
          }
        ]).toArray();
        resolve(cartItems);
      } catch (err) {
        console.error("Error in getCarts:", err);
        reject(err);  // Reject the promise with an error if something goes wrong
      }
    });
  }
  
};
