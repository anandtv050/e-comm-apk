const db = require('../config/connection');

module.exports = {
    addProduct: (product, callback) => {

        const database = db.get();
        if (!database) {
            console.error("❌ Database instance is null. Ensure that the database is connected before calling addProduct.");
            return callback(false);
        }

        // console.log("🔍 DB Instance:", database);

        database.collection('product').insertOne(product)
            .then((data) =>{
                console.log(data)
                callback(data)
            }
             )
            .catch((err) => {
                console.error("❌ Error inserting product:", err);
                callback(false);
            });
    }
};
