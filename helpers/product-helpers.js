var db = require("../config/connection");
var collection = require("../config/collection");
const { ObjectId } = require("mongodb"); // Make sure this is imported
const { response } = require("express");
module.exports = {
  addProduct: (product, callback) => {
    const database = db.get();
    if (!database) {
      console.error(
        "❌ Database instance is null. Ensure that the database is connected before calling addProduct."
      );
      return callback(false);
    }

    // console.log("🔍 DB Instance:", database);

    database
      .collection("product")
      .insertOne(product)
      .then((data) => {
        console.log(data);
        callback(data);
      })

      .catch((err) => {
        console.error("❌ Error inserting product:", err);
        callback(false);
      });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  deletProduct: (productid) => {
    return new Promise((resolve, reject) => {
      if (!ObjectId.isValid(productid)) {
        console.error("❌ Invalid ObjectId format:", productid);
        return reject("Invalid ObjectId");
      }

      console.log("🆗 Deleting product with ID:", productid);

      const database = db.get();
      if (!database) {
        console.error("❌ Database connection not established.");
        return reject("Database connection error");
      }

      database
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: new ObjectId(productid) })
        .then((response) => {
          console.log("✅ Delete Response:", response);
          if (response.deletedCount === 0) {
            console.warn("⚠️ No product found with this ID:", productid);
            return reject("No product deleted");
          }
          resolve(response);
        })
        .catch((err) => {
          console.error("❌ Error deleting product:", err);
          reject(err);
        });
    });
  },
  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: new ObjectId(proId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  updateProduct: (productId, ProductDetails) => {
    console.log("from helper",ProductDetails);

    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: new ObjectId(productId)},{
          $set:{
            name:ProductDetails.name,
            category:ProductDetails.category,
            Price:ProductDetails.Price,
            Description:ProductDetails.Description
          }
      }).then((response)=>{
        resolve()
      })
    });
  },
};
