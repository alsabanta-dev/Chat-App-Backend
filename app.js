const path = require('path');
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Routers
const userRouter = require('./routes/userRoutes')
const conversationRouter = require('./routes/conversationRoutes')
const messageRouter = require('./routes/messageRoutes');
const { joinRoom } = require('./controllers/roomController');
const sockets = require('./sockets');

// Express App
const app = express()

// Cors
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'UPDATE', 'PATCH','DELETE']
}))

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
 
// Routes
app.use('/api/v1/users', userRouter)
app.use('/api/v1/conversations', conversationRouter)
app.use('/api/v1/messages', messageRouter)

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Chat App'
    })
})

app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    })
        
});

sockets()



// Error handling
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app 