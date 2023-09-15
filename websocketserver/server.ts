import { v4 } from 'uuid';

type ClientInfo = {
	lnglat: { lng: number; lat: number };
	zoomlevel: number;
};

const clientMap = new Map<string, ClientInfo>();

const server = Bun.serve<{ clientId: string }>({
	fetch(req, server) {
		const success = server.upgrade(req, {
			data: {
				clientId: v4()
			}
		});
		if (success) return undefined;
		return new Response('Upgrade failed :(', { status: 500 });
	},
	websocket: {
		// define websocket handlers
		async open(ws) {
			ws.send(JSON.stringify({ clientId: ws.data.clientId }));
			ws.subscribe('all');
		},
		async message(ws, message) {
			try {
				const data = JSON.parse(message as string);
				clientMap.set(ws.data.clientId, { lnglat: data.lnglat, zoomlevel: data.zoomlevel });
			} catch (error) {
				console.error(error);
			}
		},
		async close(ws) {
			ws.unsubscribe('all');
			clientMap.delete(ws.data.clientId);
		}
	}
});

setInterval(() => {
	const allClientInfo = Array.from(clientMap.entries()).map(([clientId, info]) => ({
		lnglat: info.lnglat,
		zoomlevel: info.zoomlevel,
		clientId: clientId
	}));
	allClientInfo.push({
		clientId: 'test1',
		lnglat: { lat: 0, lng: -120.0 },
		zoomlevel: 1
	});
	allClientInfo.push({
		clientId: 'test2',
		lnglat: { lat: 0, lng: -110.4194 },
		zoomlevel: 2
	});
	allClientInfo.push({
		clientId: 'test3',
		lnglat: { lat: 0, lng: -100.1278 },
		zoomlevel: 3
	});
	allClientInfo.push({
		clientId: 'test4',
		lnglat: { lat: 0, lng: -90.0 },
		zoomlevel: 4
	});
	allClientInfo.push({
		clientId: 'test5',
		lnglat: { lat: 0, lng: -80.0 },
		zoomlevel: 5
	});
	allClientInfo.push({
		clientId: 'test6',
		lnglat: { lat: 0, lng: -70.0 },
		zoomlevel: 6
	});
	allClientInfo.push({
		clientId: 'test7',
		lnglat: { lat: 0, lng: -60.0 },
		zoomlevel: 7
	});
	allClientInfo.push({
		clientId: 'test8',
		lnglat: { lat: 0, lng: -50.0 },
		zoomlevel: 8
	});
	allClientInfo.push({
		clientId: 'test9',
		lnglat: { lat: 0, lng: -40.0 },
		zoomlevel: 9
	});
	allClientInfo.push({
		clientId: 'test10',
		lnglat: { lat: 0, lng: -30.0 },
		zoomlevel: 10
	});
	allClientInfo.push({
		clientId: 'test11',
		lnglat: { lat: 0, lng: -20.0 },
		zoomlevel: 11
	});
	allClientInfo.push({
		clientId: 'test12',
		lnglat: { lat: 0, lng: -10.0 },
		zoomlevel: 12
	});
	allClientInfo.push({
		clientId: 'test13',
		lnglat: { lat: 0, lng: 0.0 },
		zoomlevel: 13
	});
	allClientInfo.push({
		clientId: 'test14',
		lnglat: { lat: 0, lng: 10.0 },
		zoomlevel: 14
	});
	allClientInfo.push({
		clientId: 'test15',
		lnglat: { lat: 0, lng: 20.0 },
		zoomlevel: 15
	});

	server.publish('all', JSON.stringify(allClientInfo));
}, 16);

console.log(`Listening on ${server.hostname}:${server.port}`);
