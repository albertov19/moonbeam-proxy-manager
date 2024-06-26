import React, { useEffect, useState } from 'react';
import { Container, Button, Menu, Icon } from 'semantic-ui-react';
import Head from 'next/head';
import Link from 'next/link';
import * as ethers from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import ProxyComponent from '../components/proxy-component';

const ProxyManager = () => {
  const [account, setAccount] = useState('Not Connected');
  const [connected, setConnected] = useState(false);
  const [networkName, setNetworkName] = useState('Not Connected');

  useEffect(() => {
    const initialize = async () => {
      await checkMetamask();
    };
    initialize();

    if ((window as any).ethereum) {
      (window as any).ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      (window as any).ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const checkMetamask = async () => {
    const provider = (await detectEthereumProvider({
      mustBeMetaMask: true,
    })) as any;

    if (provider) {
      const chainId = await provider.request({ method: 'eth_chainId' });
      let networkName;

      switch (chainId) {
        case '0x507':
          networkName = 'Moonbase Alpha';
          break;
        case '0x505':
          networkName = 'Moonriver';
          break;
        case '0x504':
          networkName = 'Moonbeam';
          break;
        default:
          networkName = '';
          setAccount(
            'Only Moonbeam, Moonriver and Moonbase Alpha are Supported'
          );
          break;
      }

      if (networkName) {
        setNetworkName(networkName);
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts) {
          setAccount(ethers.utils.getAddress(accounts[0]));
          setConnected(true);
        }
      }
    } else {
      setAccount('MetaMask not Detected');
    }
  };

  const onConnect = async () => {
    await checkMetamask();
  };

  return (
    <Container>
      <Head>
        <title>Moonbeam Proxy Manager</title>
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon.png' />
      </Head>
      <div style={{ paddingTop: '10px' }} />
      <Menu>
        <Link href='/' legacyBehavior>
          <a className='item'>Moonbeam Proxy Manager</a>
        </Link>
        <Menu.Menu position='right'>
          <span className='item'>{account}</span>
          {connected ? (
            <Button floated='right' icon labelPosition='left' color='green'>
              <Icon name='check' />
              {networkName}
            </Button>
          ) : (
            <Button
              floated='right'
              icon
              labelPosition='left'
              onClick={onConnect}
              primary
            >
              <Icon name='plus square' />
              Connect MetaMask
            </Button>
          )}
        </Menu.Menu>
      </Menu>
      <br />
      <h2>Moonbeam Proxy Manager</h2>
      {connected ? (
        <ProxyComponent account={account} />
      ) : (
        <h3>Connect Metamask</h3>
      )}
      <br />
      <p>
        <b>Use at your own Risk!</b>
      </p>
      <p>
        Don't judge the code :) as it is for demonstration purposes only. You
        can check the source code&nbsp;
        <a href='https://github.com/albertov19/moonbeam-proxy-manager'>here</a>
      </p>
      <br />
    </Container>
  );
};

export default ProxyManager;
