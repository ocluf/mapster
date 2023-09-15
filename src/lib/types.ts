export type State = {
	client?: string;
	mouseInfo: Array<{
		client: string;
		position: {
			latLng: {
				lat: number;
				lng: number;
			};
			zoomlevel: number;
		};
	}>;
};

export type Pin = {
	latlng: string;
	title: string;
	description: string;
	ip_address_creator: string;
	type: 'world' | 'city' | 'street';
};
