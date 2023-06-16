import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Message, Table, Input, Dropdown } from 'semantic-ui-react';
import { polkadotProvider } from '../web3/polkadotAPI';
import * as ethers from 'ethers';
import proxyInstance from '../web3/proxy';

const proxyTypes = [
  {
    key: 0,
    text: 'Any',
    value: 0,
  },
  {
    key: 1,
    text: 'NonTransfer',
    value: 1,
  },
  {
    key: 2,
    text: 'Governance',
    value: 2,
  },
  {
    key: 3,
    text: 'Staking',
    value: 3,
  },
  {
    key: 4,
    text: 'CancelProxy',
    value: 4,
  },
  {
    key: 5,
    text: 'Balances',
    value: 5,
  },
  {
    key: 6,
    text: 'AuthorMapping',
    value: 6,
  },
  {
    key: 7,
    text: 'IdentityJudgement',
    value: 7,
  },
];

const ProxyComponent = ({ account, connector, provider }) => {
  // Variables
  const [proxies, setProxies] = useState(Array());
  const [proxy, setProxy] = useState('');
  const [proxyType, setProxyType] = useState('');
  const [delay, setDelay] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      // Get API Provider
      await getProxys();
    };

    loadData();
  }, []);

  const getProxys = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const api = await polkadotProvider();

      if (account) {
        const proxyAccounts = (await api.query.proxy.proxies(account)).toHuman()[0];

        setProxies(proxyAccounts);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }

    setLoading(false);
  };

  const renderRows = () => {
    if (proxies.length !== 0) {
      return proxies.map((proxy) => {
        return renderRow(proxy);
      });
    }
  };

  const renderRow = (proxy) => {
    const { Row, Cell } = Table;

    return (
      <Row key={proxy.delegate}>
        <Cell>{proxy.delegate}</Cell>
        <Cell>{proxy.proxyType}</Cell>
        <Cell>{proxy.delay}</Cell>
        <Cell>
          <Button
            color='orange'
            loading={loading}
            onClick={() => {
              removeProxy(proxy);
            }}
            disabled={loading}
          >
            {' '}
            Remove{' '}
          </Button>
        </Cell>
      </Row>
    );
  };

  const checkAddress = (account) => {
    if (ethers.utils.isAddress(account)) {
      return ethers.utils.getAddress(account);
    } else {
      return account;
    }
  };

  const handleChange = (_, { value }) => {
    setProxyType(value);
  };

  const addProxy = async () => {
    const proxyPrecompile = proxyInstance(provider);

    setLoading(true);
    setErrorMessage('');

    try {
      const txData = await proxyPrecompile.populateTransaction.addProxy(proxy, proxyType, delay);

      const txHash = await connector.sendTransaction({
        from: account,
        to: txData.to,
        data: txData.data,
      });

      console.log(txHash);
      await provider.waitForTransaction(txHash);

      await getProxys();
    } catch (err) {
      setErrorMessage(err.message);
    }

    setLoading(false);
  };

  const removeProxy = async (proxyInfo) => {
    const proxyPrecompile = proxyInstance(provider);

    setLoading(true);
    setErrorMessage('');

    try {
      const proxyIndex = proxyTypes.findIndex((proxyType) => proxyType.text === proxyInfo.proxyType);
      const txData = await proxyPrecompile.populateTransaction.removeProxy(
        proxyInfo.delegate,
        proxyIndex,
        proxyInfo.delay
      );

      const txHash = await connector.sendTransaction({
        from: account,
        to: txData.to,
        data: txData.data,
      });

      await provider.waitForTransaction(txHash);

      await getProxys();
    } catch (err) {
      setErrorMessage(err.message);
    }

    setLoading(false);
  };

  const removeAll = async () => {
    const proxyPrecompile = proxyInstance(provider);

    setLoading(true);
    setErrorMessage('');

    try {
      const txData = await proxyPrecompile.populateTransaction.removeProxies();
      const txHash = await connector.sendTransaction({
        from: account,
        to: txData.to,
        data: txData.data,
      });

      await provider.waitForTransaction(txHash);

      await getProxys();
    } catch (err) {
      setErrorMessage(err.message);
    }

    setLoading(false);
  };

  const { Header, Row, HeaderCell, Body } = Table;

  return (
    <Container>
      <Form error={!!{ errorMessage }.errorMessage}>
        <h3>Add Proxy</h3>
        <Input
          fluid
          label={{ content: 'Enter Proxy Address:' }}
          placeholder='Proxy Address...'
          onChange={(input) => {
            let address = checkAddress(input.target.value);
            setProxy(address);
          }}
        />
        <Header as='h5'>Select Proxy Type:</Header>
        <Dropdown clearable placeholder=' Proxy Type' selection options={proxyTypes} onChange={handleChange} />
        <br />
        <br />
        <Input
          fluid
          label={{ content: 'Enter Delay:' }}
          placeholder='Delay...'
          onChange={(input) => {
            setDelay(input.target.value);
          }}
        />
        <br />
        <Button type='submit' color='orange' loading={loading} onClick={() => addProxy()} disabled={loading}>
          Add Proxy
        </Button>

        <h3>Proxy List</h3>
        <Table>
          <Header>
            <Row>
              <HeaderCell>Proxy Address</HeaderCell>
              <HeaderCell>Proxy Type</HeaderCell>
              <HeaderCell>Delay</HeaderCell>
              <HeaderCell>Remove?</HeaderCell>
            </Row>
          </Header>
          <Body>{renderRows()}</Body>
        </Table>

        <Button type='submit' color='red' loading={loading} onClick={() => removeAll()} disabled={loading}>
          Remove All Proxies
        </Button>
        <Message error header='Oops!' content={errorMessage} />
      </Form>
    </Container>
  );
};

export default ProxyComponent;
