const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Autorise toutes les origines pour le test
    methods: ["GET", "POST"]
  }
});

// Génération des 300 sièges
let seats = [];
const rows = 50; 
const cols = ['A', 'B', 'C', 'D', 'E', 'F']; 
for (let i = 1; i <= rows; i++) {
  cols.forEach(c => seats.push({ id: `${i}${c}`, status: 'available' }));
}

io.on('connection', (socket) => {
  socket.emit('update_seats', seats);

  socket.on('request_seat', (seatId) => {
    const seat = seats.find(s => s.id === seatId);
    if (seat && seat.status === 'available') {
      seat.status = 'pending';
      io.emit('update_seats', seats);
    }
  });

  socket.on('admin_decision', ({ seatId, approved }) => {
    const seat = seats.find(s => s.id === seatId);
    if (seat) {
      seat.status = approved ? 'booked' : 'available';
      io.emit('update_seats', seats);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Serveur sur port ${PORT}`));