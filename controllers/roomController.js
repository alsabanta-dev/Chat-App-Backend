// const {io} = require('../app.js')
// const catchAsync = require('../utils/catchAsync')

// exports.joinRoom = catchAsync(async (req, res, next) => {
  
//   const conversationIo = io.of(`/conversation/${req.params.conversationId}`)
//   conversationIo.on('connection', socket => {
//     /*
//         👉 Connect to conversation
//         1. Get conversationId header
//         2. Check if there are already a room has the same conversationId, if not create one

//         👉 Sending and receiving messages
//         1. Whe
//     */

//     console.log('🔥', socket.rooms)
//     const conversationId = socket.handshake.headers.conversationid
//     console.log('conversationId:', conversationId)
//     console.log('connected: ',socket.id)

//     socket.on('send-message', (message, userId) => {
//         console.log('userId:', userId)
//         console.log(socket.id, ':', message)
        
//         socket.broadcast.emit('receive-message', message, userId)
//     })

//     socket.on('contact-status', status => { 
//         socket.broadcast.emit('change-status', status)
//         console.log(socket.id, 'Status:',status)
//     })
//   })

//   res.status(200).json({
//     status: 'success',
//     message: 'Joined conversation successfully'
//   })

// })
