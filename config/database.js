const mongoose = require('mongoose');

class Database {
    constructor() {
        this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/scaler-funnelmind';
    }

    async connect() {
        try {
            await mongoose.connect(this.connectionString);
            
            console.log('📦 MongoDB: ✅ Connected successfully');
            
            // Listen for connection events
            mongoose.connection.on('error', (error) => {
                console.error('📦 MongoDB connection error:', error);
            });
            
            mongoose.connection.on('disconnected', () => {
                console.warn('📦 MongoDB: ⚠️ Disconnected');
            });
            
            mongoose.connection.on('reconnected', () => {
                console.log('📦 MongoDB: 🔄 Reconnected');
            });
            
        } catch (error) {
            console.error('📦 MongoDB connection failed:', error);
            console.log('   💡 Make sure MongoDB is running and MONGODB_URI is configured in .env');
            console.log('   🔄 Server will continue with in-memory storage for demo purposes');
            // Don't throw error - allow server to start with fallback mode
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            console.log('📦 MongoDB: 👋 Disconnected gracefully');
        } catch (error) {
            console.error('📦 MongoDB disconnect error:', error);
        }
    }

    getConnectionStatus() {
        const state = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        return {
            state: states[state] || 'unknown',
            connected: state === 1
        };
    }
}

module.exports = new Database();