const { MongoClient } = require('mongodb');

const state = {
    db: null
};

module.exports.connect = function (done) {
    const url = 'mongodb://localhost:27017';
    const dbName = 'shopping';

    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            console.log('✅ Database Connected Successfully');
            state.db = client.db(dbName);
            done();
        })
        .catch(err => {
            console.error('❌ Database Connection Failed:', err);
            done(err);
        });
};

module.exports.get = function () {
    return state.db; // Return only the `db` object, not the entire `state`
};
