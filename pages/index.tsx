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
  const [navi, setNavigator] = useState<Navigator | undefined>(undefined);

  useEffect(() => {
    setNavigator(navigator);

    const initProvider = async () => {
      // Check for changes in Metamask (account and chain)
      const provider: any = await detectEthereumProvider({
        mustBeMetaMask: true,
      });

      if (provider) {
        provider.on('chainChanged', () => {
          window.location.reload();
        });
        provider.on('accountsChanged', () => {
          window.location.reload();
        });
      }
    };

    initProvider();
  }, []);

  const checkMetamask = async () => {
    const provider: any = await detectEthereumProvider({
      mustBeMetaMask: true,
    });
    let accounts;

    if (provider) {
      accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await provider.request({
        method: 'eth_chainId',
      });

      console.log(chainId);

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
          setAccount('Only Moonbeam, Moonriver or Moonbase Alpha Supported');
          break;
      }
      if (networkName !== '') {
        setNetworkName(networkName);

        // Update State
        if (accounts) {
          setAccount(ethers.utils.getAddress(accounts[0]));
          setConnected(true);
        }
      }
    } else {
      // MetaMask not detected
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
