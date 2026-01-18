const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const apptRoutes = require('./routes/apptRoutes');

const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options(/.*/, cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/appointments', apptRoutes);

const PORT = process.env.PORT || 5001;
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Real-time listeners
  socket.on('join_chat', (chatId) => socket.join(chatId));
  socket.on('send_message', (data) => {
    io.to(data.chatId).emit('receive_message', data);
  });
});

// 4. CRITICAL: Listen on 'server', NOT 'app'
server.listen(5001, () => {
  console.log('Server is running on port 5001');
});