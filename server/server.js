const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const PORT = 5000;
const ROOM_LEN = 12; // kode room max 12 karakter

// Simpen member per room: { "NINJA-BEKASI": [ {address, port},... ] }
const rooms = {};

server.on('message', (msg, rinfo) => {
  // 12 byte pertama = nama room, sisanya = data suara Opus
  const roomName = msg.toString('utf8', 0, ROOM_LEN).trim();
  const audioData = msg.slice(ROOM_LEN);

  // Daftarin client ke room kalo belum ada
  if (!rooms[roomName]) rooms[roomName] = [];
  if (!rooms[roomName].find(c => c.address === rinfo.address && c.port === rinfo.port)) {
    rooms[roomName].push({ address: rinfo.address, port: rinfo.port });
    console.log(`${rinfo.address} join room ${roomName}`);
  }

  // Broadcast ke semua member room kecuali pengirim
  if (rooms[roomName]) {
    rooms[roomName].forEach(client => {
      if (client.address!== rinfo.address || client.port!== rinfo.port) {
        server.send(msg, client.port, client.address);
      }
    });
  }
});

server.on('listening', () => {
  console.log(`Ninja Talky Server jalan di port ${PORT}`);
});
server.bind(PORT);
