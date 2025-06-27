# 🪙 BSN Token-Lifecycle-Logik

**📅 Erstellt**: 21. Dezember 2024  
**📝 Status**: Vollständige Token-Entwicklung und Migration-Strategie  
**🎯 Zweck**: Detaillierte Logik für Token-Einführung, Migration und Blockchain-Übergänge

---

## 🔄 **Token-Lifecycle Überblick**

Der BSN Token durchläuft **3 Hauptphasen** mit verschiedenen technischen Implementierungen:

| Phase | Status | Speicherung | Blockchain | Withdrawal | Zweck |
|-------|--------|-------------|------------|------------|-------|
| **Simulation** | Virtuell | Datenbank | Keine | Nein | ICO/Faucet |
| **Multi-Chain** | ERC-20/SPL | Smart Contracts | ETH/Polygon/SOL | Ja | Echter Token |
| **Native Chain** | BSN Native | Eigene Blockchain | BSN Chain | Ja | Vollständige Kontrolle |

---

## 🎭 **Phase 1: Token-Simulation (0 - 100k Nutzer)**

### **🔧 Technische Implementierung:**

#### **Datenbank-Schema:**
```sql
-- Nutzer-Guthaben Tabelle
CREATE TABLE user_balances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    balance_type VARCHAR(20), -- 'faucet', 'ico_purchase', 'referral'
    amount DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ICO-Käufe Tabelle  
CREATE TABLE ico_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount_usd DECIMAL(10,2),
    token_amount DECIMAL(18,8),
    token_price DECIMAL(10,6),
    payment_method VARCHAR(50), -- 'crypto', 'fiat', 'card'
    transaction_hash VARCHAR(255), -- Für Krypto-Zahlungen
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Faucet-Claims Tabelle
CREATE TABLE faucet_claims (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(18,8) DEFAULT 1.0,
    claimed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    INDEX idx_user_time (user_id, claimed_at)
);
```

#### **Token-Verwaltung API:**
```python
class TokenSimulationService:
    def get_user_balance(self, user_id):
        """Gesamtguthaben aus allen Quellen"""
        faucet_balance = FaucetClaim.objects.filter(user_id=user_id).aggregate(
            total=Sum('amount'))['total'] or 0
        ico_balance = ICOPurchase.objects.filter(
            user_id=user_id, status='confirmed').aggregate(
            total=Sum('token_amount'))['total'] or 0
        return faucet_balance + ico_balance
    
    def claim_faucet(self, user_id):
        """Faucet-Claim alle 4 Stunden"""
        last_claim = FaucetClaim.objects.filter(
            user_id=user_id).order_by('-claimed_at').first()
        
        if last_claim and (timezone.now() - last_claim.claimed_at).seconds < 14400:
            raise Exception("Faucet noch nicht verfügbar")
        
        FaucetClaim.objects.create(user_id=user_id, amount=1.0)
        return True
```

### **💰 ICO/Presale-System:**

#### **Preisstufen-Logik:**
```python
ICO_PHASES = [
    {"phase": 1, "price": 0.10, "max_tokens": 100_000_000},  # $0.10
    {"phase": 2, "price": 0.15, "max_tokens": 200_000_000},  # $0.15  
    {"phase": 3, "price": 0.20, "max_tokens": 300_000_000},  # $0.20
    {"phase": 4, "price": 0.25, "max_tokens": 400_000_000},  # $0.25
]

def get_current_ico_price():
    """Aktuelle ICO-Phase und Preis"""
    total_sold = ICOPurchase.objects.filter(
        status='confirmed').aggregate(
        total=Sum('token_amount'))['total'] or 0
    
    for phase in ICO_PHASES:
        if total_sold < phase["max_tokens"]:
            return phase["price"]
    
    return ICO_PHASES[-1]["price"]  # Fallback
```

### **📊 Frontend-Integration:**
```jsx
// Wallet-Dashboard zeigt simulierte Token
const WalletDashboard = () => {
    const [balance, setBalance] = useState({
        faucet: 0,
        ico: 0,
        total: 0
    });
    
    const [nextFaucetClaim, setNextFaucetClaim] = useState(null);
    
    return (
        <div className="wallet-simulation">
            <div className="balance-card">
                <h3>BSN Token (Simuliert)</h3>
                <div className="balance-breakdown">
                    <div>Faucet: {balance.faucet} BSN</div>
                    <div>ICO Käufe: {balance.ico} BSN</div>
                    <div className="total">Gesamt: {balance.total} BSN</div>
                </div>
            </div>
            
            <div className="faucet-section">
                <button 
                    disabled={nextFaucetClaim > Date.now()}
                    onClick={claimFaucet}
                >
                    {nextFaucetClaim > Date.now() 
                        ? `Nächster Claim in ${formatTime(nextFaucetClaim)}`
                        : "1 BSN Token claimen"
                    }
                </button>
            </div>
            
            <div className="ico-section">
                <h4>ICO Teilnehmen</h4>
                <div>Aktueller Preis: ${getCurrentPrice()} pro BSN</div>
                <TokenPurchaseForm />
            </div>
            
            <div className="info-banner">
                ℹ️ Diese Token sind simuliert. Bei 100.000 Nutzern werden sie zu echten BSN Token!
            </div>
        </div>
    );
};
```

---

## 🚀 **Phase 2: Multi-Chain Token-Launch (100k - 5M Nutzer)**

### **🎯 Migration-Trigger bei 100.000 Nutzern:**

#### **Automatische Migration-Pipeline:**
```python
class TokenMigrationService:
    def check_migration_trigger(self):
        """Prüft ob 100k Nutzer erreicht"""
        user_count = User.objects.filter(is_active=True).count()
        if user_count >= 100_000 and not self.migration_started():
            self.initiate_token_launch()
    
    def initiate_token_launch(self):
        """Startet Token-Launch Prozess"""
        # 1. Smart Contracts deployen
        self.deploy_smart_contracts()
        
        # 2. Migration-System aktivieren
        self.activate_migration_system()
        
        # 3. Öffentliche Ankündigung
        self.announce_token_launch()
        
        # 4. Withdrawal-System aktivieren
        self.activate_withdrawal_system()
        
        # 5. Mining-System starten
        self.activate_mining_system()
```

### **🔗 Multi-Chain Smart Contract Deployment:**

#### **Ethereum (ERC-20):**
```solidity
// BSN Token auf Ethereum
contract BSNToken is ERC20, Ownable, Pausable {
    uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**18; // 10 Mrd
    
    mapping(address => bool) public authorizedMinters;
    
    constructor() ERC20("BSN Social Network", "BSN") {
        _mint(owner(), TOTAL_SUPPLY);
    }
    
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized");
        _mint(to, amount);
    }
    
    // LayerZero Integration für Cross-Chain
    function sendToChain(uint16 dstChainId, bytes calldata to, uint256 amount) external payable {
        // LayerZero OFT Implementation
    }
}
```

#### **Polygon (ERC-20):**
```solidity
// Identischer Contract auf Polygon
contract BSNTokenPolygon is BSNToken {
    // Polygon-spezifische Optimierungen
}
```

#### **Solana (SPL Token):**
```rust
// BSN Token auf Solana
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};

#[program]
pub mod bsn_token {
    pub fn initialize_token(ctx: Context<InitializeToken>) -> Result<()> {
        // SPL Token Initialisierung
        let total_supply = 10_000_000_000 * 10u64.pow(9); // 10 Mrd mit 9 Dezimalstellen
        
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            total_supply,
        )?;
        
        Ok(())
    }
}
```

### **💸 Withdrawal-System:**

#### **Auszahlungsantrag-Workflow:**
```python
class WithdrawalService:
    def request_withdrawal(self, user_id, amount, target_chain, wallet_address):
        """Nutzer stellt Auszahlungsantrag"""
        user_balance = TokenSimulationService().get_user_balance(user_id)
        
        if amount > user_balance:
            raise InsufficientBalanceError()
        
        # Erstelle Withdrawal-Request
        withdrawal = WithdrawalRequest.objects.create(
            user_id=user_id,
            amount=amount,
            target_chain=target_chain,
            wallet_address=wallet_address,
            status='pending'
        )
        
        # Benachrichtige Admins
        self.notify_admins(withdrawal)
        
        return withdrawal
    
    def approve_withdrawal(self, withdrawal_id, admin_user):
        """Admin genehmigt Auszahlung"""
        withdrawal = WithdrawalRequest.objects.get(id=withdrawal_id)
        
        # Validierungen
        self.validate_wallet_address(withdrawal.wallet_address, withdrawal.target_chain)
        self.validate_user_balance(withdrawal.user_id, withdrawal.amount)
        
        # Führe Blockchain-Transfer aus
        tx_hash = self.execute_blockchain_transfer(
            withdrawal.target_chain,
            withdrawal.wallet_address, 
            withdrawal.amount
        )
        
        # Update Status
        withdrawal.status = 'completed'
        withdrawal.transaction_hash = tx_hash
        withdrawal.approved_by = admin_user
        withdrawal.approved_at = timezone.now()
        withdrawal.save()
        
        # Reduziere User-Balance in DB
        self.reduce_user_balance(withdrawal.user_id, withdrawal.amount)
```

#### **Admin-Dashboard für Approvals:**
```jsx
const WithdrawalApprovalDashboard = () => {
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    
    const approveWithdrawal = async (withdrawalId) => {
        try {
            await api.post(`/admin/withdrawals/${withdrawalId}/approve`);
            // Refresh list
            fetchPendingWithdrawals();
        } catch (error) {
            alert('Approval failed: ' + error.message);
        }
    };
    
    return (
        <div className="admin-withdrawals">
            <h2>Pending Withdrawals</h2>
            {pendingWithdrawals.map(withdrawal => (
                <div key={withdrawal.id} className="withdrawal-card">
                    <div>User: {withdrawal.user.email}</div>
                    <div>Amount: {withdrawal.amount} BSN</div>
                    <div>Chain: {withdrawal.target_chain}</div>
                    <div>Address: {withdrawal.wallet_address}</div>
                    <button onClick={() => approveWithdrawal(withdrawal.id)}>
                        Approve
                    </button>
                    <button onClick={() => rejectWithdrawal(withdrawal.id)}>
                        Reject
                    </button>
                </div>
            ))}
        </div>
    );
};
```

---

## 🌐 **Phase 3: Native Blockchain (5M+ Nutzer)**

### **🔗 BSN Chain Entwicklung:**

#### **Blockchain-Spezifikationen:**
```yaml
# BSN Chain Konfiguration
chain_name: "BSN Network"
chain_id: "bsn-1"
consensus: "Proof of Stake"
block_time: "3 seconds"
native_token: "BSN"
decimals: 18

# Validator Requirements
min_stake: "100,000 BSN"
max_validators: 100
slashing_rate: "5%"

# Features
smart_contracts: true
evm_compatible: true
cross_chain_bridges: ["ethereum", "polygon", "bsc", "solana"]
```

#### **Migration zur eigenen Chain:**
```python
class ChainMigrationService:
    def initiate_chain_migration(self):
        """Startet Migration zur BSN Chain"""
        # 1. BSN Chain Mainnet Launch
        self.launch_bsn_mainnet()
        
        # 2. Cross-Chain Bridges aktivieren
        self.activate_bridges()
        
        # 3. Migration-Incentives starten
        self.start_migration_incentives()
        
        # 4. Community-Voting für Migration
        self.create_migration_proposal()
    
    def migrate_user_to_bsn_chain(self, user_id):
        """Migriert Nutzer zur BSN Chain"""
        # Hole aktuelle Balances von allen Chains
        balances = self.get_multi_chain_balances(user_id)
        
        # Erstelle BSN Chain Wallet
        bsn_wallet = self.create_bsn_wallet(user_id)
        
        # Bridge Token zur BSN Chain
        for chain, balance in balances.items():
            if balance > 0:
                self.bridge_to_bsn_chain(
                    from_chain=chain,
                    to_address=bsn_wallet.address,
                    amount=balance
                )
        
        # Update User-Präferenz
        user = User.objects.get(id=user_id)
        user.preferred_chain = 'bsn'
        user.save()
```

### **🌉 Cross-Chain Bridge-System:**
```solidity
// BSN Chain Bridge Contract
contract BSNBridge {
    mapping(string => address) public chainTokens; // chain_name => token_address
    mapping(bytes32 => bool) public processedTransfers;
    
    event CrossChainTransfer(
        string fromChain,
        string toChain,
        address indexed user,
        uint256 amount,
        bytes32 transferId
    );
    
    function bridgeFromEthereum(
        address user,
        uint256 amount,
        bytes32 transferId
    ) external onlyValidator {
        require(!processedTransfers[transferId], "Already processed");
        
        // Mint BSN Token auf BSN Chain
        BSNNativeToken(chainTokens["bsn"]).mint(user, amount);
        
        processedTransfers[transferId] = true;
        
        emit CrossChainTransfer("ethereum", "bsn", user, amount, transferId);
    }
}
```

---

## 📊 **Migration-Monitoring & Analytics**

### **Migration-Metriken:**
```python
class MigrationAnalytics:
    def get_migration_stats(self):
        return {
            "total_users": User.objects.count(),
            "migrated_users": User.objects.filter(preferred_chain='bsn').count(),
            "migration_rate": self.calculate_migration_rate(),
            "total_value_migrated": self.calculate_migrated_value(),
            "chain_distribution": self.get_chain_distribution()
        }
    
    def get_chain_distribution(self):
        """Verteilung der Token auf verschiedenen Chains"""
        return {
            "ethereum": self.get_chain_balance("ethereum"),
            "polygon": self.get_chain_balance("polygon"),
            "bsc": self.get_chain_balance("bsc"),
            "solana": self.get_chain_balance("solana"),
            "bsn_native": self.get_chain_balance("bsn")
        }
```

### **Migration-Incentives:**
```python
MIGRATION_INCENTIVES = {
    "early_adopter": {
        "requirement": "Migrate within first 30 days",
        "reward": "10% bonus BSN",
        "nft_badge": "Early Adopter NFT"
    },
    "whale_migration": {
        "requirement": "Migrate >100,000 BSN",
        "reward": "5% bonus + VIP status",
        "benefits": ["Lower fees", "Priority support"]
    },
    "complete_migration": {
        "requirement": "Migrate all balances from all chains",
        "reward": "Special governance NFT",
        "voting_power": "2x voting power in DAO"
    }
}
```

---

## ⚠️ **Risikomanagement & Rollback-Strategien**

### **Migration-Rollback-Plan:**
```python
class MigrationRollback:
    def emergency_rollback(self, reason):
        """Notfall-Rollback bei kritischen Problemen"""
        # 1. Pausiere alle Migrations-Operationen
        self.pause_migrations()
        
        # 2. Erstelle Snapshot des aktuellen Zustands
        snapshot = self.create_state_snapshot()
        
        # 3. Benachrichtige Community
        self.notify_emergency_rollback(reason)
        
        # 4. Aktiviere Rollback-Prozess
        self.execute_rollback(snapshot)
    
    def validate_migration_integrity(self):
        """Prüft Integrität der Migration"""
        checks = [
            self.verify_token_supply(),
            self.verify_user_balances(),
            self.verify_bridge_integrity(),
            self.verify_smart_contract_state()
        ]
        
        return all(checks)
```

---

*Diese Token-Lifecycle-Logik gewährleistet eine sichere und kontrollierte Evolution des BSN Tokens von der Simulation bis zur vollständigen Dezentralisierung auf der eigenen Blockchain.* 