import React, { useEffect, useState } from 'react';
import { Container, Button, Menu, Icon } from 'semantic-ui-react';
import Head from 'next/head';
import Link from 'next/link';
import * as ethers from 'ethers';
import ProxyComponent from '../components/proxy-component';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { SUPPORTED_NETWORKS } from '../web3/supportedNetworks';

const ProxyManager = () => {
  // Initial State
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connector, setConnector] = useState(null);
  const [provider, setProvider] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const onConnect = async (chainId, connectedAccount) => {
      setAccount(connectedAccount);
      setChainId(chainId);

      let networkName;
      console.log(chainId);
      switch (chainId) {
        case 1287:
        case 1285:
        case 1284:
          const provider = new ethers.providers.JsonRpcProvider(SUPPORTED_NETWORKS[chainId].rpc_url, {
            chainId,
            name: SUPPORTED_NETWORKS[chainId].name,
          });

          setProvider(provider);
          break;
        default:
          setAccount('Only Moonbeam, Moonriver and Moonbase Alpha are Supported');
          break;
      }
    };

    const refreshData = async () => {
      const { chainId, accounts } = connector;
      await onConnect(chainId, accounts[0]);
      setFetching(false);
    };

    if (connector) {
      connector.on('connect', async (error, payload) => {
        const { chainId, accounts } = payload.params[0];
        await onConnect(chainId, accounts[0]);
        setFetching(false);
      });

      connector.on('disconnect', (error, payload) => {
        if (error) {
          throw error;
        }
        resetApp();
      });

      if ((!chainId || !account) && connector.connected) {
        refreshData();
      }
    }
  }, [connector, chainId, account]);

  const resetApp = () => {
    setConnector(null);
    setFetching(false);
    setAccount(null);
    setChainId(null);
  };

  const killSession = () => {
    // Make sure the connector exists before trying to kill the session
    if (connector) {
      connector.killSession();
    }
    resetApp();
  };

  const connectWallet = async () => {
    const connector = new WalletConnect({ bridge: 'https://bridge.walletconnect.org', qrcodeModal: QRCodeModal });

    if (!connector.connected) {
      await connector.createSession();
    }

    setConnector(connector);
  };

  return (
    <Container>
      <Head>
        <title>Moonbeam Proxy Manager</title>
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon.png' />
        <link rel='stylesheet' href='//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css' />
      </Head>
      <div style={{ paddingTop: '10px' }} />
      <Menu>
        <Link href='/'>
          <a className='item'>Moonbeam Proxy Manager</a>
        </Link>
        <Menu.Menu position='right'>
          <a className='item'> {account} </a>
          {connector?.connected ? (
            <Button floated='right' icon labelPosition='left' color='red' onClick={killSession} primary>
              <Icon name='window close outline'></Icon>
              Disconnect
            </Button>
          ) : (
            <Button floated='right' icon labelPosition='left' onClick={connectWallet} primary>
              <Icon name='plus square'></Icon>
              Connect Wallet
            </Button>
          )}
        </Menu.Menu>
      </Menu>
      <br />
      <h2>Moonbeam Proxy Manager</h2>
      {connector?.connected ? (
        <ProxyComponent account={account} connector={connector} provider={provider} />
      ) : (
        <h3>Connect Wallet</h3>
      )}
      <br />
      <p>
        <b>Use at your own Risk!</b>
      </p>
      <p>
        Don't judge the code :) as it is for demostration purposes only. You can check the source code &nbsp;
        <a href='https://github.com/albertov19/moonbeam-proxy-manager'>here</a>
      </p>
      <br />
    </Container>
  );
};

export default ProxyManager;
