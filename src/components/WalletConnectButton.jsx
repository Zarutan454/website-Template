import React from 'react';
import { Web3Button } from '@web3modal/react';

const WalletConnectButton = ({ className = '' }) => {
  return <Web3Button className={className} />;
};

export default WalletConnectButton; 