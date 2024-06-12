import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Container,
  Message,
  Table,
  Input,
  Dropdown,
  Header as SemanticHeader,
} from 'semantic-ui-react';
import { polkadotProvider } from '../web3/polkadotAPI';
import * as ethers from 'ethers';
import proxyInstance from '../web3/proxy';

const proxyTypes = [
  { key: 0, text: 'Any', value: 0 },
  { key: 1, text: 'NonTransfer', value: 1 },
  { key: 2, text: 'Governance', value: 2 },
  { key: 3, text: 'Staking', value: 3 },
  { key: 4, text: 'CancelProxy', value: 4 },
  { key: 5, text: 'Balances', value: 5 },
  { key: 6, text: 'AuthorMapping', value: 6 },
  { key: 7, text: 'IdentityJudgement', value: 7 },
];

const ProxyComponent = ({ account }) => {
  const [proxies, setProxies] = useState([]);
  const [proxy, setProxy] = useState('');
  const [proxyType, setProxyType] = useState('');
  const [delay, setDelay] = useState('0');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await getProxies();
    };

    loadData();
  }, []);

  const getProxies = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const api = await polkadotProvider();
      const proxyAccounts = (
        await api.query.proxy.proxies(account)
      ).toHuman()[0];
      setProxies(proxyAccounts);
    } catch (err) {
      setErrorMessage(err.message);
    }

    setLoading(false);
  };

  const renderRows = () => {
    return proxies.length > 0 ? proxies.map((proxy) => renderRow(proxy)) : null;
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
            onClick={() => removeProxy(proxy)}
            disabled={loading}
          >
            Remove
          </Button>
        </Cell>
      </Row>
    );
  };

  const checkAddress = (address) => {
    return ethers.utils.isAddress(address)
      ? ethers.utils.getAddress(address)
      : address;
  };

  const handleChange = (e, { value }) => {
    setProxyType(value);
  };

  const addProxy = async () => {
    const proxyPrecompile = proxyInstance();

    setLoading(true);
    setErrorMessage('');

    try {
      const tx = await proxyPrecompile.addProxy(proxy, proxyType, delay);
      await tx.wait();
      await getProxies();
    } catch (err) {
      setErrorMessage(err.message);
    }

    setLoading(false);
  };

  const removeProxy = async (proxyInfo) => {
    const proxyPrecompile = proxyInstance();

    setLoading(true);
    setErrorMessage('');

    try {
      const proxyIndex = proxyTypes.findIndex(
        (type) => type.text === proxyInfo.proxyType
      );
      const tx = await proxyPrecompile.removeProxy(
        proxyInfo.delegate,
        proxyIndex,
        proxyInfo.delay
      );
      await tx.wait();
      await getProxies();
    } catch (err) {
      setErrorMessage(err.message);
    }

    setLoading(false);
  };

  const removeAll = async () => {
    const proxyPrecompile = proxyInstance();

    setLoading(true);
    setErrorMessage('');

    try {
      const tx = await proxyPrecompile.removeProxies();
      await tx.wait();
      await getProxies();
    } catch (err) {
      setErrorMessage(err.message);
    }

    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addProxy();
  };

  const { Header, Row, HeaderCell, Body } = Table;

  return (
    <Container>
      <Form error={!!errorMessage} onSubmit={handleSubmit}>
        <h3>Add Proxy</h3>
        <Input
          fluid
          label={{ content: 'Enter Proxy Address:' }}
          placeholder='Proxy Address...'
          onChange={(e) => setProxy(checkAddress(e.target.value))}
        />
        <SemanticHeader as='h5'>Select Proxy Type:</SemanticHeader>
        <Dropdown
          clearable
          placeholder='Proxy Type'
          selection
          options={proxyTypes}
          onChange={handleChange}
        />
        <br />
        <br />
        <Input
          fluid
          label={{ content: 'Enter Delay:' }}
          placeholder='Default = 0'
          onChange={(e) => setDelay(e.target.value)}
        />
        <br />
        <Button
          type='submit'
          color='orange'
          loading={loading}
          disabled={loading}
        >
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
        <Button
          type='button'
          color='red'
          loading={loading}
          onClick={removeAll}
          disabled={loading}
        >
          Remove All Proxies
        </Button>
        <Message error header='Oops!' content={errorMessage} />
      </Form>
    </Container>
  );
};

export default ProxyComponent;
