const { ApiPromise, WsProvider } = require('@polkadot/api');
declare let ethereum: any;

export async function polkadotProvider() {
  const chains = {
    '0x507': {
      ws: 'wss://moonbase-alpha.blastapi.io/1149fdef-ff34-48c0-9be4-7d81cb673a08',
    },
    '0x505': {
      ws: 'wss://moonriver.blastapi.io/1149fdef-ff34-48c0-9be4-7d81cb673a08',
    },
    '0x504': {
      ws: 'wss://moonbeam.blastapi.io/1149fdef-ff34-48c0-9be4-7d81cb673a08',
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
