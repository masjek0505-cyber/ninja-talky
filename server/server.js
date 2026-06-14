const dgram = require('dgram');
const net = require('net');

// ========== KONFIGURASI ==========
const UDP_PORT = 5000;  // Port buat suara Opus
const TCP_PORT = 5001;  // Port buat login, channel, PTT

const udpServer = dgram.createSocket('udp4');
const tcpServer = net.createServer();

// Simpan data member: { id: { name, channel, address, port, tcpSocket } }
const members = new Map();

console.log('Ninja Talky Server starting...');

// ========== 1. SERVER UDP - BUAT SUARA ==========
udpServer.on('message', (msg, rinfo) => {
    // Cari siapa yg ngirim berdasarkan IP+Port
    let senderId = null;
    for (let [id, data] of members) {
        if (data.address === rinfo.address && data.port === rinfo.port) {
            senderId = id;
            break;
        }
    }

    // Kalo belum login, buang aja paketnya
    if (!senderId) return;

    const sender = members.get(senderId);
    const channel = sender.channel;

    // Broadcast suara ke semua member di channel yg sama, kecuali pengirim
    for (let [id, member] of members) {
        if (id !== senderId && member.channel === channel) {
            udpServer.send(msg, member.port, member.address, (err) => {
                if (err) console.log(`Gagal kirim ke ${member.name}: ${err}`);
            });
        }
    }
});

udpServer.on('listening', () => {
    console.log(`UDP
