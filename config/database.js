const mongoose = require('mongoose');

class Database {
    constructor() {
        this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/scaler-funnelmind';
        this.isConnected = false;
    }

    async connect() {
        try {
            // Check if already connected (important for Vercel serverless)
            if (mongoose.connection.readyState === 1) {
                this.isConnected = true;
                console.log('📦 MongoDB: ✅ Already connected');
                return;
            }

            // Configure mongoose for serverless environments
            mongoose.set('bufferCommands', false);
            
            await mongoose.connect(this.connectionString, {
                // Serverless-friendly options
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
                socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
                bufferMaxEntries: 0, // Disable mongoose buffering
                bufferCommands: false, // Disable mongoose buffering
                maxPoolSize: 1, // Maintain only 1 connection in the pool
            });
            
            this.isConnected = true;
            console.log('📦 MongoDB: ✅ Connected successfully');
            
            // Listen for connection events
            mongoose.connection.on('error', (error) => {
                console.error('📦 MongoDB connection error:', error);
                this.isConnected = false;
            });
            
            mongoose.connection.on('disconnected', () => {
                console.warn('📦 MongoDB: ⚠️ Disconnected');
                this.isConnected = false;
            });
            
            mongoose.connection.on('reconnected', () => {
                console.log('📦 MongoDB: 🔄 Reconnected');
                this.isConnected = true;
            });
            
        } catch (error) {
            console.error('📦 MongoDB connection failed:', error);
            console.log('   💡 Make sure MongoDB is running and MONGODB_URI is configured');
            console.log('   🔄 Server will continue with in-memory storage for demo purposes');
            this.isConnected = false;
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
            connected: state === 1 && this.isConnected
        };
    }
}

module.exports = new Database();