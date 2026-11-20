import mongoose from 'mongoose';

// Connection URI
const uri = "mongodb://localhost:27017/tfd-ctc-afternnon-d3";

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

export function connectDB() {
    // Connect to MongoDB
    mongoose.connect(uri)
        .then(() => console.log('✅ Connected to MongoDB'))
        .catch(err => console.error('❌ Connection error:', err));
}