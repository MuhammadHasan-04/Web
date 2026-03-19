const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Studentdb');
    } catch (err) {
       return err;
    }
};


connectDB().then(() => {
    console.log('Database connection established');
})
.catch(err => {
    console.error('Failed to establish database connection:', err);
});


module.exports = connectDB;