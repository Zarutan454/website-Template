import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
  logo: string;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'mining';
  amount: string;
  symbol: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

const WalletScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  const mockBalances: TokenBalance[] = [
    {
      symbol: 'BSN',
      name: 'BSN Token',
      balance: '1,234.56',
      usdValue: 1234.56,
      logo: '💎',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '0.5',
      usdValue: 1250.00,
      logo: '🔵',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '500.00',
      usdValue: 500.00,
      logo: '🔵',
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'mining',
      amount: '+10.5',
      symbol: 'BSN',
      timestamp: new Date().toISOString(),
      status: 'completed',
    },
    {
      id: '2',
      type: 'receive',
      amount: '+100',
      symbol: 'USDC',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'completed',
    },
    {
      id: '3',
      type: 'send',
      amount: '-50',
      symbol: 'BSN',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'completed',
    },
  ];

  const connectWallet = () => {
    // In a real app, this would integrate with MetaMask or WalletConnect
    Alert.alert(
      'Wallet verbinden',
      'Möchten Sie Ihre Wallet verbinden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Verbinden',
          onPress: () => {
            setIsConnected(true);
            setAccount('0x1234...5678');
            setBalances(mockBalances);
            setTransactions(mockTransactions);
            setTotalValue(2984.56);
          },
        },
      ]
    );
  };

  const disconnectWallet = () => {
    Alert.alert(
      'Wallet trennen',
      'Möchten Sie Ihre Wallet trennen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Trennen',
          onPress: () => {
            setIsConnected(false);
            setAccount(null);
            setBalances([]);
            setTransactions([]);
            setTotalValue(0);
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderBalanceCard = (balance: TokenBalance) => (
    <View key={balance.symbol} style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.tokenLogo}>{balance.logo}</Text>
        <View style={styles.balanceInfo}>
          <Text style={styles.tokenSymbol}>{balance.symbol}</Text>
          <Text style={styles.tokenName}>{balance.name}</Text>
        </View>
      </View>
      <View style={styles.balanceAmounts}>
        <Text style={styles.balanceAmount}>
          {balance.balance} {balance.symbol}
        </Text>
        <Text style={styles.balanceUSD}>
          ${balance.usdValue.toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderTransaction = (transaction: Transaction) => (
    <View key={transaction.id} style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons
          name={
            transaction.type === 'send' ? 'arrow-up' :
            transaction.type === 'receive' ? 'arrow-down' :
            'diamond'
          }
          size={20}
          color={
            transaction.type === 'send' ? '#ef4444' :
            transaction.type === 'receive' ? '#10b981' :
            '#3b82f6'
          }
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionType}>
          {transaction.type === 'send' ? 'Gesendet' :
           transaction.type === 'receive' ? 'Empfangen' :
           'Mining Reward'}
        </Text>
        <Text style={styles.transactionTime}>
          {new Date(transaction.timestamp).toLocaleDateString('de-DE')}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionAmountText,
          { color: transaction.type === 'send' ? '#ef4444' : '#10b981' }
        ]}>
          {transaction.amount} {transaction.symbol}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: transaction.status === 'completed' ? '#10b981' : '#f59e0b' }
        ]}>
          <Text style={styles.statusText}>
            {transaction.status === 'completed' ? '✓' : '⏳'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={isConnected ? disconnectWallet : connectWallet}
          >
            <Text style={styles.connectButtonText}>
              {isConnected ? 'Trennen' : 'Verbinden'}
            </Text>
          </TouchableOpacity>
        </View>

        {!isConnected ? (
          <View style={styles.connectPrompt}>
            <Ionicons name="wallet-outline" size={64} color="#6b7280" />
            <Text style={styles.connectPromptTitle}>Wallet verbinden</Text>
            <Text style={styles.connectPromptText}>
              Verbinden Sie Ihre Wallet, um Ihre Token und Transaktionen anzuzeigen.
            </Text>
            <TouchableOpacity style={styles.connectPromptButton} onPress={connectWallet}>
              <Text style={styles.connectPromptButtonText}>Wallet verbinden</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Total Balance */}
            <View style={styles.totalBalanceCard}>
              <Text style={styles.totalBalanceLabel}>Gesamtwert</Text>
              <Text style={styles.totalBalanceAmount}>
                ${totalValue.toLocaleString()}
              </Text>
              <Text style={styles.accountAddress}>{account}</Text>
            </View>

            {/* Token Balances */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Token Balances</Text>
              {balances.map(renderBalanceCard)}
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Letzte Transaktionen</Text>
              {transactions.map(renderTransaction)}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="send" size={24} color="#3b82f6" />
                <Text style={styles.actionButtonText}>Senden</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download" size={24} color="#10b981" />
                <Text style={styles.actionButtonText}>Empfangen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="swap-horizontal" size={24} color="#f59e0b" />
                <Text style={styles.actionButtonText}>Tauschen</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  connectButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  connectPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  connectPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  connectPromptText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  connectPromptButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectPromptButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  totalBalanceCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalBalanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalBalanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  accountAddress: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  balanceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenLogo: {
    fontSize: 24,
    marginRight: 12,
  },
  balanceInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  tokenName: {
    fontSize: 12,
    color: '#6b7280',
  },
  balanceAmounts: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  balanceUSD: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  transactionTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default WalletScreen; 