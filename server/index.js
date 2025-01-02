import express from 'express'
import morgan from 'morgan';
import dotenv from "dotenv";
import rateLimit from "express-rate-limit"
import helmet from "helmet";
dotenv.config();


const app = express()
const PORT = process.env.PORT

//Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try later"
    })

//Security middleware
app.use(helmet())
app.use('/api', limiter)    


//logging middleware
app.use(morgan('dev'))

// Body Parser Middleware
app.use(express.json({limit: '10kb'}))
app.use(express.urlencoded({extended: true, limit: '10kb'}))

//Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    })
})

// 404 handler
app.use((req,res) => {
    res.status(404).json({
        status: "error",
        message: "ROUTE NOT AVAILABLE",
    })
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`)
})
