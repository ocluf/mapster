import { type } from 'os';
import { v4 } from 'uuid';

type Message =
	| {
			type: 'updatePos';
			data: ClientInfo;
	  }
	| {
			type: 'createPin';
			data: {
				title: string;
				body: string;
				pinType: 'recommendation' | 'warning' | 'discussion' | 'question';
				location: string;
			};
	  };

type ClientInfo = {
	lnglat: { lng: number; lat: number };
	zoomlevel: number;
	mobile: boolean;
};

type Pin = {
	id: string;
	title: string;
	body: string;
	pinType: 'recommendation' | 'warning' | 'discussion' | 'question';
	location: string;
	lnglat: { lng: number; lat: number };
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
			console.log('open');
			const message = JSON.stringify({
				type: 'setClientId',
				data: ws.data.clientId
			});
			ws.send(message);
			ws.subscribe('all');
		},
		async message(ws, m) {
			try {
				const message = JSON.parse(m as string);

				if (message.type === 'updatePos') {
					clientMap.set(ws.data.clientId, {
						lnglat: message.data.lnglat,
						zoomlevel: message.data.zoomlevel,
						mobile: message.data.mobile
					});
				}
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
		clientId: clientId,
		mobile: info.mobile
	}));
	const message = JSON.stringify({
		type: 'updateClientInfo',
		data: allClientInfo
	});
	server.publish('all', message);
}, 16);

console.log(`Listening on ${server.hostname}:${server.port}`);
