const messageController = require('./controllers/messageController')
const conversationController = require('./controllers/conversationController')
// Socket IO
module.exports = () => {

  const io = require('socket.io')(2000, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ["GET", "POST"]   
    }
  })
  
  const connectedUsers = {}
  io.on('connection', socket => {
    const userId = socket.handshake.headers.userid
    connectedUsers[userId] = socket.id
  
    socket.emit('change-status', userId, 'Online')
  
    io.on('disconnect', () => {
      connectedUsers[userId] = undefined
      socket.emit('change-status', userId, 'Offline')
    })

    socket.on('get-user-status', (userId, callback) => {
      console.log('I am here👇', userId, connectedUsers[userId]? 'Online':'Offline')
      callback(connectedUsers[userId]?'Online':'')
    })
  })
  
  const conversations = {}
  
  const joinConversation = (conversationId, userId, roomId, userName=undefined) => {
    const conversation = conversations[conversationId]
    if(conversation){
      // Conversation exists
      const userIndex = conversation.users.findIndex(user => user.userId == userId)
      if(userIndex != -1) 
        conversation.users[userIndex].roomId = roomId
      else 
        conversation.users.push({userId, roomId, userName})
    }else{
      // Conversation doesn't exist
      conversations[conversationId] = {
        users: [{userId, roomId, userName}]
      }
  
    }
  }

  const conversationIo = io.of('/conversation')
  conversationIo.on('connection', async socket => {
  
    console.log('Connection stablish', socket.id)

    const conversationId = socket.handshake.headers.conversationid
    const userId = socket.handshake.headers.userid
    const userName = socket.handshake.headers.username
  
    if(conversationId && userId && userName){
      // console.log("👤", conversationId, userId, userName) 
      joinConversation(conversationId, userId, socket.id, userName)
      
      socket.on('send-message', async (message, file=null) => {
          // socket.broadcast.emit('receive-message', message, userId)
          const receiver = conversations[conversationId].users.find(user => user.userId != userId)
          const sender = conversations[conversationId].users.find(user => user.userId == userId)
  
          // console.log('✉️ Message', message)
          // console.log('➡️ Sender', sender)
          // console.log('➡️ Receiver', receiver)
  
          const newMessage = {
            message,
            conversation: conversationId,
            sender: sender.userId
          }
          if(file){
            newMessage.file = file.name
            newMessage.type = file.type
          }
          messageController.addMessage(newMessage)
          if(receiver)
            socket.to(receiver.roomId).emit('receive-message', message, userId)
          
          conversationController.conversation(conversationId).then(conversation => {
            conversation.parties.forEach(receiver => {
              if(connectedUsers[receiver]){
                // console.log('receiver is connected:', receiver)
                io.emit('update-conversations-list', receiver)
              }
            })
          })
          
      })
    
      socket.on('contact-status', status => { 
          const receiver = conversations[conversationId].users.find(user => user.userId != userId)
    
          if(connectedUsers[userId]) status = status? status : 'Online'
          else status = 'Offline'
          if(receiver) socket.to(receiver.roomId).emit('change-status', status)
      })
    
      socket.on('disconnect', () => {
          conversations[conversationId].users = conversations[conversationId].users.filter(user => user.roomId != socket.id)
          const receiver = conversations[conversationId].users.find(user => user.userId != userId)
          if(receiver) socket.to(receiver.roomId).emit('change-status', connectedUsers[userId]? 'Online':'Offline')
      });

      conversationController.setNewMessagesCount(conversationId, userId)
    }
  })  
}
