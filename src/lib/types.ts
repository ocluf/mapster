export type ClientsInfo = Array<{
	lnglat: { lng: number; lat: number };
	zoomlevel: number;
	clientId: string;
	mobile?: boolean;
}>;
