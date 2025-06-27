import { ETHERSCAN_CONFIG } from './wagmi'

export interface EtherscanResponse<T = unknown> {
  status: string
  message: string
  result: T
}

export interface TokenBalance {
  account: string
  balance: string
  contractAddress: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
}

export interface Transaction {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  transactionIndex: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  isError: string
  txreceipt_status: string
  input: string
  contractAddress: string
  cumulativeGasUsed: string
  gasUsed: string
  confirmations: string
}

export interface TokenTransaction extends Transaction {
  tokenSymbol: string
  tokenName: string
  tokenDecimal: string
}

class EtherscanService {
  private getApiUrl(network: 'mainnet' | 'sepolia'): string {
    const config = ETHERSCAN_CONFIG[network]
    return config.baseUrl
  }

  private getApiKey(): string {
    return ETHERSCAN_CONFIG.mainnet.apiKey
  }

  async getAccountBalance(address: string, network: 'mainnet' | 'sepolia' = 'mainnet'): Promise<string> {
    try {
      const apiKey = this.getApiKey()
      if (!apiKey) {
        throw new Error('Etherscan API key not configured')
      }

      const url = `${this.getApiUrl(network)}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
      
      const response = await fetch(url)
      const data: EtherscanResponse<string> = await response.json()
      
      if (data.status === '1') {
        return data.result
      } else {
        throw new Error(`Etherscan API error: ${data.message}`)
      }
    } catch (error) {
      console.error('Error fetching account balance:', error)
      throw error
    }
  }

  async getTokenBalances(address: string, network: 'mainnet' | 'sepolia' = 'mainnet'): Promise<TokenBalance[]> {
    try {
      const apiKey = this.getApiKey()
      if (!apiKey) {
        throw new Error('Etherscan API key not configured')
      }

      const url = `${this.getApiUrl(network)}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
      
      const response = await fetch(url)
      const data: EtherscanResponse<TokenTransaction[]> = await response.json()
      
      if (data.status === '1') {
        // If no transactions found, return empty array (this is normal)
        if (!data.result || data.result.length === 0) {
          console.log('No token transactions found for address - this is normal for new addresses');
          return []
        }
        
        // Group transactions by token and calculate balances
        const tokenBalances = new Map<string, TokenBalance>()
        
        data.result.forEach(tx => {
          if (tx.contractAddress && tx.tokenSymbol) {
            const key = tx.contractAddress.toLowerCase()
            
            if (!tokenBalances.has(key)) {
              tokenBalances.set(key, {
                account: address,
                balance: '0',
                contractAddress: tx.contractAddress,
                tokenName: tx.tokenName || tx.tokenSymbol,
                tokenSymbol: tx.tokenSymbol,
                tokenDecimal: tx.tokenDecimal || '18'
              })
            }
            
            const balance = tokenBalances.get(key)!
            // This is a simplified balance calculation
            // In a real implementation, you'd need to track all transfers
            if (tx.to.toLowerCase() === address.toLowerCase()) {
              balance.balance = (parseInt(balance.balance) + parseInt(tx.value)).toString()
            } else if (tx.from.toLowerCase() === address.toLowerCase()) {
              balance.balance = (parseInt(balance.balance) - parseInt(tx.value)).toString()
            }
          }
        })
        
        return Array.from(tokenBalances.values())
      } else if (data.message === 'No transactions found') {
        // This is a normal case for addresses with no token transactions
        console.log('No token transactions found for address - this is normal for new addresses');
        return []
      } else {
        throw new Error(`Etherscan API error: ${data.message}`)
      }
    } catch (error) {
      console.error('Error fetching token balances:', error)
      throw error
    }
  }

  async getTransactions(address: string, network: 'mainnet' | 'sepolia' = 'mainnet', page = 1, offset = 10): Promise<Transaction[]> {
    try {
      const apiKey = this.getApiKey()
      if (!apiKey) {
        throw new Error('Etherscan API key not configured')
      }

      const url = `${this.getApiUrl(network)}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=desc&apikey=${apiKey}`
      
      const response = await fetch(url)
      const data: EtherscanResponse<Transaction[]> = await response.json()
      
      if (data.status === '1') {
        return data.result || []
      } else {
        throw new Error(`Etherscan API error: ${data.message}`)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }
}

export const etherscanService = new EtherscanService() 
