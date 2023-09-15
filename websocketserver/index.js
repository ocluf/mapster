import express from 'express';
import { WebSocketServer } from 'ws';
import { v4 } from 'uuid';

const app = express();
const port = 3000;
const broadcastRate = 16;

const wss = new WebSocketServer({ port: 8081 });

let mouseLatlngMap = new Map();

let intervalId = setInterval(() => {
	let mouseInfoArray = [];

	for (let [id, position] of mouseLatlngMap) {
		mouseInfoArray.push({ client: id, position });
	}

	// Initialize mouseInfoArray with some random mouse coordinates for testing
	mouseInfoArray = [
		{ client: 'test1', position: { lat: 37.7749, lng: -122.4194 } },
		{ client: 'test2', position: { lat: 40.7128, lng: -74.006 } },
		{ client: 'test3', position: { lat: 51.5074, lng: -0.1278 } }
	];

	wss.clients.forEach((client) => {
		try {
			const message = JSON.stringify({ client: client.id, mouseInfo: mouseInfoArray });
			client.send(message);
		} catch (err) {
			console.error('Failed to send message to client:', err);
		}
	});
}, broadcastRate);

wss.on('connection', (ws) => {
	const clientId = v4();
	ws.id = clientId;
	console.log('Client connected:', clientId);

	ws.on('error', (err) => {
		console.error(err);
	});

	ws.on('message', (data) => {
		try {
			let latlng = JSON.parse(data);
			mouseLatlngMap.set(ws.id, latlng);
		} catch (err) {
			console.error('Failed to parse incoming message:', err);
		}
	});

	ws.on('close', () => {
		mouseLatlngMap.delete(ws.id);
	});
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
