import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds


class DatabaseConnecetion{
    constructor(){
        this.retryCount = 0
        this.isConnected = false

        // configure mongoose settings
        mongoose.set('strictQuery', true)

        mongoose.connection.on('connected', () => {
            console.log('Connected to MongoDB');
            this.isConnected = true;
        })
        mongoose.connection.on('error', () => {
            console.log('Error connecting to MongoDB');
            this.isConnected = false;
        })
        mongoose.connection.on('disconnected', () => {
            console.log('Disconnected from MongoDB');
            this.handleDisconnection();

        })


        process.on('SIGTERM', this.handleAppTermination.bind(this))
    }

    async connect() {
        try {
            if(!process.env.MONGO_URI){
                throw new Error(" MONGO db URI is not defined in env variables")
            }
    
            const connectionOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4 // Use IPv4
            };
    
            if(process.env.NODE_ENV === 'development'){
                mongoose.set('debug', true)
            }
    
            await mongoose.connect(process.env.MONGO_URI, connectionOptions);
            this.retryCount = 0 // reset retry count on success
        } catch (error) {
            console.error (error.message)
            await this.handleConnectionError()
        } 

    }

    async handleConnectionError(){
        if(this.retryCount < MAX_RETRIES){
            this.retryCount++;
            console.log(`retrying connection to mongo in ${RETRY_INTERVAL}ms`);

            await new Promise(resolve => setTimeout(() => {
                resolve
            }, RETRY_INTERVAL))
            return this.connect()
        } else {
            console.error(`Failed to connect MongoDb after ${MAX_RETRIES} attempts`)
            process.exit(1);
        }
    }

    async handleDisconnection(){
        if(!this.isConnected){
            console.log('Attempting to reconnect MongoDb')
            this.connect()
        }
    }

    async handleAppTermination(){
        try {
            await mongoose.connection.close()
            console.log('MongoDb connection closed through app termination')
            process.exit(0)
        } catch (error) {
            console.error('Error during database disconnection', error)
            process.exit(1)

        }
    }

    getConnectionStatus(){
        return{
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name
        }
    }
}

// create a singleton instance

const dbConnection = new DatabaseConnecetion()
export default dbConnection.connect.bind(dbConnection)
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection)