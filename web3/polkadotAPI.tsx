const { ApiPromise, WsProvider } = require('@polkadot/api');
declare let ethereum: any;

export async function polkadotProvider() {
  const chains = {
    '0x507': {
      ws: 'wss://moonbase.unitedbloc.com',
    },
    '0x505': {
      ws: 'wss://moonriver.unitedbloc.com',
    },
    '0x504': {
      ws: 'wss://moonbeam.unitedbloc.com',
    },
  };

  if (typeof ethereum !== 'undefined') {
    // Create WS Provider
    const wsProvider = new WsProvider(chains[ethereum.chainId].ws);

    // Wait for Provider
    const api = await ApiPromise.create({
      provider: wsProvider,
    });
    await api.isReady;

    return api;
  }
}
