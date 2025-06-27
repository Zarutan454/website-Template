# 🌉 BSN Blockchain-Migration-Strategie

**📅 Erstellt**: 21. Dezember 2024  
**📝 Status**: Vollständige Migration-Strategie für alle Blockchain-Übergänge  
**🎯 Zweck**: Detaillierte Strategie für sichere und effiziente Blockchain-Migrationen

---

## 🔄 **Migration-Phasen Überblick**

BSN durchläuft **3 kritische Migrations-Phasen**:

| Migration | Von | Zu | Trigger | Zeitrahmen | Risiko |
|-----------|-----|----|---------|-----------|---------| 
| **Simulation → Multi-Chain** | DB | ETH/Polygon/SOL | 100k Nutzer | 2-4 Wochen | Hoch |
| **Multi-Chain → BSN Chain** | Multi-Chain | BSN Native | 5M Nutzer | 6-12 Monate | Kritisch |
| **Cross-Chain Optimization** | Einzelne Chains | Optimierte Verteilung | Kontinuierlich | Laufend | Niedrig |

---

## 🎯 **Migration 1: Simulation → Multi-Chain (100k Nutzer)**

### **🚀 Pre-Migration Phase (4 Wochen vor Launch)**

#### **Smart Contract Entwicklung & Audit:**
```solidity
// BSN Multi-Chain Token Contract
pragma solidity ^0.8.19;

import "@layerzerolabs/solidity-examples/contracts/token/oft/OFT.sol";

contract BSNToken is OFT {
    uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**18; // 10 Milliarden
    
    // Migration-spezifische Events
    event TokensMigrated(address indexed user, uint256 amount, string sourceType);
    event WithdrawalApproved(address indexed user, uint256 amount, bytes32 requestId);
    
    // Authorized addresses für Migration
    mapping(address => bool) public migrationOperators;
    
    modifier onlyMigrationOperator() {
        require(migrationOperators[msg.sender], "Not authorized for migration");
        _;
    }
    
    constructor(address _layerZeroEndpoint) OFT("BSN Social Network", "BSN", _layerZeroEndpoint) {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    function migrateBulkTokens(
        address[] calldata users,
        uint256[] calldata amounts,
        string[] calldata sourceTypes
    ) external onlyMigrationOperator {
        require(users.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            _transfer(msg.sender, users[i], amounts[i]);
            emit TokensMigrated(users[i], amounts[i], sourceTypes[i]);
        }
    }
}
```

#### **Migration-System Backend:**
```python
class MigrationSystemV1:
    def __init__(self):
        self.chains = {
            'ethereum': EthereumConnector(),
            'polygon': PolygonConnector(),
            'bsc': BSCConnector(),
            'solana': SolanaConnector()
        }
        self.migration_status = 'preparation'
    
    def prepare_migration(self):
        """Bereitet Migration vor"""
        # 1. Snapshot aller Nutzer-Guthaben
        self.create_balance_snapshot()
        
        # 2. Smart Contracts auf allen Chains deployen
        self.deploy_contracts()
        
        # 3. Liquidität auf DEXs bereitstellen
        self.setup_liquidity_pools()
        
        # 4. Withdrawal-System konfigurieren
        self.setup_withdrawal_system()
        
        # 5. Migration-Dashboard aktivieren
        self.activate_migration_dashboard()
    
    def create_balance_snapshot(self):
        """Erstellt Snapshot aller Nutzer-Guthaben"""
        snapshot_data = []
        
        for user in User.objects.filter(is_active=True):
            balance_data = {
                'user_id': user.id,
                'email': user.email,
                'wallet_address': user.wallet_address,
                'faucet_balance': self.get_faucet_balance(user.id),
                'ico_balance': self.get_ico_balance(user.id),
                'referral_balance': self.get_referral_balance(user.id),
                'total_balance': self.get_total_balance(user.id),
                'snapshot_date': timezone.now()
            }
            snapshot_data.append(balance_data)
        
        # Speichere Snapshot in separater Tabelle
        MigrationSnapshot.objects.bulk_create([
            MigrationSnapshot(**data) for data in snapshot_data
        ])
        
        return len(snapshot_data)
    
    def deploy_contracts(self):
        """Deployed Smart Contracts auf allen Chains"""
        deployment_results = {}
        
        for chain_name, connector in self.chains.items():
            try:
                contract_address = connector.deploy_bsn_token()
                deployment_results[chain_name] = {
                    'success': True,
                    'contract_address': contract_address,
                    'deployment_tx': connector.get_deployment_tx()
                }
            except Exception as e:
                deployment_results[chain_name] = {
                    'success': False,
                    'error': str(e)
                }
        
        return deployment_results
```

### **🎊 Migration-Launch Phase (Launch-Woche)**

#### **Öffentliche Ankündigung:**
```python
class MigrationAnnouncement:
    def announce_token_launch(self):
        """Öffentliche Token-Launch Ankündigung"""
        announcement = {
            'title': '🚀 BSN Token Launch - Echte Token sind da!',
            'message': '''
            Nach dem Erreichen von 100.000 Nutzern ist es soweit:
            
            🎉 BSN Token sind jetzt LIVE auf:
            • Ethereum (ETH)
            • Polygon (MATIC) 
            • BNB Smart Chain (BNB)
            • Solana (SOL)
            
            ✨ Deine simulierten Token werden zu echten BSN Token!
            💰 Mining-System ist jetzt aktiv (10 BSN/Tag)
            🏦 Withdrawal-System ist verfügbar
            
            So funktioniert's:
            1. Gehe zu deinem Wallet-Dashboard
            2. Sieh deine echten BSN Token
            3. Stelle Withdrawal-Anträge für externe Wallets
            4. Starte Mining für tägliche Rewards
            
            Welcome to the real BSN Economy! 🌟
            ''',
            'channels': ['in_app', 'email', 'social_media', 'press_release']
        }
        
        # Sende Ankündigung über alle Kanäle
        self.send_announcement(announcement)
        
        # Aktiviere Migration-Features
        self.activate_migration_features()
    
    def send_migration_emails(self):
        """Personalisierte Migration-E-Mails"""
        for user in User.objects.filter(is_active=True):
            balance = self.get_user_balance(user.id)
            
            email_content = f'''
            Hallo {user.first_name},
            
            🎉 Deine {balance} simulierten BSN Token sind jetzt ECHTE Token!
            
            Dein neues Guthaben:
            • Faucet: {self.get_faucet_balance(user.id)} BSN
            • ICO-Käufe: {self.get_ico_balance(user.id)} BSN
            • Gesamt: {balance} BSN
            
            Jetzt verfügbar:
            ⛏️ Mining: Verdiene 10 BSN/Tag
            💸 Withdrawal: Abhebung auf externe Wallets
            🎮 NFTs: Mint und trade NFTs
            
            Login und entdecke die neuen Features!
            '''
            
            self.send_email(user.email, email_content)
```

### **💸 Withdrawal-System Aktivierung:**

#### **Withdrawal-Request Workflow:**
```python
class WithdrawalSystemV1:
    def request_withdrawal(self, user_id, amount, target_chain, wallet_address):
        """Nutzer stellt Withdrawal-Antrag"""
        # Validierungen
        user_balance = self.get_user_balance(user_id)
        if amount > user_balance:
            raise InsufficientBalanceError()
        
        if not self.validate_wallet_address(wallet_address, target_chain):
            raise InvalidWalletAddressError()
        
        # Erstelle Withdrawal-Request
        withdrawal = WithdrawalRequest.objects.create(
            user_id=user_id,
            amount=amount,
            target_chain=target_chain,
            wallet_address=wallet_address,
            status='pending',
            request_date=timezone.now()
        )
        
        # Reserviere Balance (verhindert Doppel-Withdrawals)
        self.reserve_balance(user_id, amount, withdrawal.id)
        
        # Benachrichtige Admin-Team
        self.notify_withdrawal_team(withdrawal)
        
        return withdrawal
    
    def approve_withdrawal(self, withdrawal_id, admin_user):
        """Admin genehmigt Withdrawal"""
        withdrawal = WithdrawalRequest.objects.get(id=withdrawal_id)
        
        try:
            # Führe Blockchain-Transfer aus
            tx_hash = self.execute_blockchain_transfer(
                withdrawal.target_chain,
                withdrawal.wallet_address,
                withdrawal.amount
            )
            
            # Update Withdrawal-Status
            withdrawal.status = 'completed'
            withdrawal.transaction_hash = tx_hash
            withdrawal.approved_by = admin_user
            withdrawal.approved_date = timezone.now()
            withdrawal.save()
            
            # Reduziere User-Balance
            self.reduce_user_balance(withdrawal.user_id, withdrawal.amount)
            
            # Benachrichtige User
            self.notify_withdrawal_success(withdrawal)
            
        except Exception as e:
            # Rollback bei Fehler
            withdrawal.status = 'failed'
            withdrawal.error_message = str(e)
            withdrawal.save()
            
            # Gebe reservierte Balance frei
            self.release_reserved_balance(withdrawal.user_id, withdrawal.amount)
            
            raise WithdrawalExecutionError(str(e))
```

### **📊 Migration-Monitoring:**

#### **Real-time Migration Dashboard:**
```jsx
const MigrationDashboard = () => {
    const [migrationStats, setMigrationStats] = useState({});
    
    useEffect(() => {
        const fetchStats = async () => {
            const stats = await api.get('/migration/stats');
            setMigrationStats(stats.data);
        };
        
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Update alle 30s
        
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="migration-dashboard">
            <h2>🚀 Token Migration Live Dashboard</h2>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Migrierte Nutzer</h3>
                    <div className="value">
                        {migrationStats.migrated_users?.toLocaleString()} / {migrationStats.total_users?.toLocaleString()}
                    </div>
                    <div className="percentage">
                        {((migrationStats.migrated_users / migrationStats.total_users) * 100).toFixed(1)}%
                    </div>
                </div>
                
                <div className="stat-card">
                    <h3>Migrierte Token</h3>
                    <div className="value">
                        {migrationStats.migrated_tokens?.toLocaleString()} BSN
                    </div>
                    <div className="percentage">
                        {((migrationStats.migrated_tokens / migrationStats.total_tokens) * 100).toFixed(1)}%
                    </div>
                </div>
                
                <div className="stat-card">
                    <h3>Withdrawal-Requests</h3>
                    <div className="value">
                        {migrationStats.pending_withdrawals} Pending
                    </div>
                    <div className="completed">
                        {migrationStats.completed_withdrawals} Completed
                    </div>
                </div>
                
                <div className="stat-card">
                    <h3>Mining-Aktivität</h3>
                    <div className="value">
                        {migrationStats.active_miners} Aktive Miner
                    </div>
                    <div className="percentage">
                        {((migrationStats.active_miners / migrationStats.total_users) * 100).toFixed(1)}%
                    </div>
                </div>
            </div>
            
            <div className="chain-distribution">
                <h3>Token-Verteilung nach Chains</h3>
                <ChainDistributionChart data={migrationStats.chain_distribution} />
            </div>
        </div>
    );
};
```

---

## 🌐 **Migration 2: Multi-Chain → BSN Chain (5M Nutzer)**

### **🏗️ BSN Chain Entwicklung (6-12 Monate)**

#### **Blockchain-Architektur:**
```yaml
# BSN Chain Spezifikationen
bsn_chain:
  name: "BSN Network"
  chain_id: "bsn-mainnet-1"
  consensus: "Delegated Proof of Stake (DPoS)"
  block_time: "3 seconds"
  finality: "1 second"
  tps: "10,000+"
  
  native_token:
    symbol: "BSN"
    decimals: 18
    total_supply: "10,000,000,000"
    
  validators:
    max_validators: 100
    min_stake: "1,000,000 BSN"
    slashing_conditions:
      - double_signing: "5%"
      - downtime: "1%"
      - malicious_behavior: "100%"
      
  features:
    smart_contracts: true
    evm_compatibility: true
    cross_chain_bridges: true
    built_in_governance: true
    native_staking: true
    
  governance:
    proposal_threshold: "100,000 BSN"
    voting_period: "7 days"
    execution_delay: "2 days"
    quorum: "10% of total staked"
```

#### **BSN Chain Smart Contracts:**
```solidity
// BSN Chain Native Token Contract
pragma solidity ^0.8.19;

contract BSNNativeToken {
    string public constant name = "BSN Social Network";
    string public constant symbol = "BSN";
    uint8 public constant decimals = 18;
    uint256 public totalSupply = 10_000_000_000 * 10**18;
    
    // Cross-chain migration tracking
    mapping(address => bool) public migratedFromChain;
    mapping(string => uint256) public chainMigrationTotals;
    
    event CrossChainMigration(
        address indexed user,
        string fromChain,
        uint256 amount,
        bytes32 migrationId
    );
    
    function migrateCrossChain(
        address user,
        string memory fromChain,
        uint256 amount,
        bytes32 migrationId,
        bytes memory signature
    ) external {
        // Verify migration signature from bridge
        require(verifyMigrationSignature(user, fromChain, amount, migrationId, signature), "Invalid signature");
        
        // Mint tokens for migrated user
        _mint(user, amount);
        
        // Track migration
        chainMigrationTotals[fromChain] += amount;
        
        emit CrossChainMigration(user, fromChain, amount, migrationId);
    }
}

// BSN Chain Governance Contract
contract BSNGovernance {
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        ProposalType proposalType;
    }
    
    enum ProposalType {
        PARAMETER_CHANGE,
        TREASURY_SPEND,
        VALIDATOR_CHANGE,
        PROTOCOL_UPGRADE
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    uint256 public constant PROPOSAL_THRESHOLD = 100_000 * 10**18; // 100k BSN
    uint256 public constant VOTING_PERIOD = 7 days;
    
    function createProposal(
        string memory title,
        string memory description,
        ProposalType proposalType
    ) external {
        require(BSNToken(bsnToken).balanceOf(msg.sender) >= PROPOSAL_THRESHOLD, "Insufficient BSN");
        
        uint256 proposalId = nextProposalId++;
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + VOTING_PERIOD,
            executed: false,
            proposalType: proposalType
        });
        
        emit ProposalCreated(proposalId, msg.sender, title);
    }
}
```

### **🌉 Cross-Chain Bridge System:**

#### **Bridge-Architektur:**
```python
class BSNChainBridge:
    def __init__(self):
        self.supported_chains = ['ethereum', 'polygon', 'bsc', 'solana']
        self.bridge_validators = self.load_bridge_validators()
        self.migration_incentives = self.load_migration_incentives()
    
    def initiate_migration_to_bsn(self, user_id, from_chain, amount):
        """Startet Migration zur BSN Chain"""
        # 1. Lock Token auf Source-Chain
        lock_tx = self.lock_tokens_on_source_chain(from_chain, user_id, amount)
        
        # 2. Erstelle Migration-Request
        migration_request = MigrationRequest.objects.create(
            user_id=user_id,
            from_chain=from_chain,
            to_chain='bsn',
            amount=amount,
            lock_tx_hash=lock_tx,
            status='pending'
        )
        
        # 3. Benachrichtige Bridge-Validators
        self.notify_bridge_validators(migration_request)
        
        return migration_request
    
    def validate_migration(self, migration_id, validator_signatures):
        """Validiert Migration mit Multi-Sig"""
        migration = MigrationRequest.objects.get(id=migration_id)
        
        # Prüfe Validator-Signaturen
        valid_signatures = self.verify_validator_signatures(
            migration_id, validator_signatures
        )
        
        if len(valid_signatures) >= self.required_signatures:
            # Mint Token auf BSN Chain
            mint_tx = self.mint_tokens_on_bsn_chain(
                migration.user_id,
                migration.amount,
                migration.from_chain
            )
            
            # Update Migration-Status
            migration.status = 'completed'
            migration.mint_tx_hash = mint_tx
            migration.completed_at = timezone.now()
            migration.save()
            
            # Zahle Migration-Incentive
            self.pay_migration_incentive(migration)
            
            return True
        
        return False
    
    def calculate_migration_incentive(self, migration):
        """Berechnet Migration-Incentive"""
        base_incentive = migration.amount * 0.05  # 5% Bonus
        
        # Early Adopter Bonus
        if self.is_early_adopter(migration.user_id):
            base_incentive *= 1.5
        
        # Large Migration Bonus
        if migration.amount >= 100000:  # 100k BSN
            base_incentive *= 1.2
        
        return min(base_incentive, migration.amount * 0.1)  # Max 10% Bonus
```

### **🎯 Migration-Incentive-System:**

#### **Migration-Belohnungen:**
```python
MIGRATION_INCENTIVES = {
    "early_adopter": {
        "requirement": "Migrate within first 30 days of BSN Chain launch",
        "reward": "10% bonus BSN + Early Adopter NFT",
        "additional_benefits": [
            "Reduced transaction fees for 1 year",
            "Priority validator selection",
            "Exclusive governance proposals"
        ]
    },
    "whale_migration": {
        "requirement": "Migrate >1,000,000 BSN",
        "reward": "15% bonus BSN + Whale NFT",
        "additional_benefits": [
            "VIP support channel",
            "Custom validator node setup",
            "Direct team communication"
        ]
    },
    "complete_migration": {
        "requirement": "Migrate all balances from all chains",
        "reward": "Special governance NFT with 2x voting power",
        "additional_benefits": [
            "Lifetime premium features",
            "Revenue sharing participation",
            "Advisory board consideration"
        ]
    },
    "community_leader": {
        "requirement": "Refer 100+ users who also migrate",
        "reward": "Community Leader NFT + 20% bonus",
        "additional_benefits": [
            "Community moderator privileges",
            "Event hosting capabilities",
            "Marketing partnership opportunities"
        ]
    }
}
```

### **📊 Migration-Tracking & Analytics:**

#### **Migration-Metriken:**
```python
class MigrationAnalytics:
    def get_migration_progress(self):
        """Detaillierte Migration-Fortschritt"""
        return {
            "total_eligible_users": self.get_total_eligible_users(),
            "migrated_users": self.get_migrated_users(),
            "migration_rate": self.calculate_migration_rate(),
            "chain_breakdown": {
                "ethereum": self.get_chain_migration_stats('ethereum'),
                "polygon": self.get_chain_migration_stats('polygon'),
                "bsc": self.get_chain_migration_stats('bsc'),
                "solana": self.get_chain_migration_stats('solana')
            },
            "value_migrated": self.get_total_value_migrated(),
            "incentives_paid": self.get_total_incentives_paid(),
            "migration_timeline": self.get_migration_timeline()
        }
    
    def predict_migration_completion(self):
        """Vorhersage der Migration-Vollendung"""
        current_rate = self.get_weekly_migration_rate()
        remaining_users = self.get_remaining_users()
        
        estimated_weeks = remaining_users / current_rate if current_rate > 0 else float('inf')
        
        return {
            "estimated_completion_date": timezone.now() + timedelta(weeks=estimated_weeks),
            "confidence_interval": self.calculate_confidence_interval(estimated_weeks),
            "risk_factors": self.identify_migration_risks()
        }
```

---

## ⚠️ **Risikomanagement & Rollback-Strategien**

### **🚨 Notfall-Rollback-Protokoll:**

#### **Rollback-Trigger:**
```python
class MigrationRollback:
    def __init__(self):
        self.rollback_triggers = {
            "critical_bug": "Smart contract vulnerability discovered",
            "bridge_compromise": "Cross-chain bridge security breach",
            "validator_attack": "Validator network under attack",
            "community_rejection": "Community votes against migration",
            "regulatory_issue": "Legal/regulatory problems"
        }
    
    def emergency_rollback(self, trigger_reason, affected_users=None):
        """Notfall-Rollback bei kritischen Problemen"""
        # 1. Pausiere alle Migration-Operationen
        self.pause_all_migrations()
        
        # 2. Erstelle Zustand-Snapshot
        snapshot = self.create_emergency_snapshot()
        
        # 3. Benachrichtige alle Stakeholder
        self.notify_emergency_rollback(trigger_reason)
        
        # 4. Führe Rollback durch
        if affected_users:
            self.rollback_specific_users(affected_users)
        else:
            self.rollback_all_migrations()
        
        # 5. Aktiviere Kompensation
        self.activate_user_compensation()
        
        return snapshot
    
    def rollback_specific_users(self, user_list):
        """Rollback für spezifische Nutzer"""
        for user_id in user_list:
            # Hole Original-Balances
            original_balance = self.get_pre_migration_balance(user_id)
            
            # Restore auf allen Original-Chains
            for chain, balance in original_balance.items():
                self.restore_balance_on_chain(user_id, chain, balance)
            
            # Entferne BSN Chain Balance
            self.remove_bsn_chain_balance(user_id)
            
            # Kompensiere Verluste
            self.compensate_user(user_id)
```

### **🔒 Sicherheitsmaßnahmen:**

#### **Multi-Layer-Sicherheit:**
```python
class MigrationSecurity:
    def __init__(self):
        self.security_layers = [
            "smart_contract_audits",
            "multi_signature_validation", 
            "time_lock_mechanisms",
            "circuit_breakers",
            "anomaly_detection",
            "community_governance"
        ]
    
    def verify_migration_integrity(self, migration_batch):
        """Mehrstufige Sicherheitsverifikation"""
        checks = []
        
        # 1. Kryptographische Verifizierung
        checks.append(self.verify_cryptographic_proofs(migration_batch))
        
        # 2. Balance-Konsistenz
        checks.append(self.verify_balance_consistency(migration_batch))
        
        # 3. Validator-Konsens
        checks.append(self.verify_validator_consensus(migration_batch))
        
        # 4. Anomalie-Erkennung
        checks.append(self.detect_migration_anomalies(migration_batch))
        
        # 5. Community-Überwachung
        checks.append(self.check_community_alerts(migration_batch))
        
        return all(checks)
    
    def implement_circuit_breaker(self, migration_volume, time_window):
        """Circuit Breaker für hohe Migration-Volumina"""
        if migration_volume > self.max_hourly_migration:
            self.pause_migrations("High volume circuit breaker activated")
            self.notify_security_team("Circuit breaker: High migration volume")
            
        if self.detect_unusual_patterns(time_window):
            self.pause_migrations("Unusual pattern circuit breaker activated")
            self.notify_security_team("Circuit breaker: Unusual migration patterns")
```

---

## 📈 **Erfolgs-Metriken & KPIs**

### **Migration-Erfolg Indikatoren:**

```python
MIGRATION_SUCCESS_KPIS = {
    "adoption_metrics": {
        "migration_rate": {
            "target": "80% of users migrate within 6 months",
            "measurement": "migrated_users / eligible_users"
        },
        "value_migration": {
            "target": "75% of token value migrated within 3 months", 
            "measurement": "migrated_value / total_value"
        },
        "retention_rate": {
            "target": "90% of migrated users remain active",
            "measurement": "active_migrated_users / total_migrated_users"
        }
    },
    "technical_metrics": {
        "migration_success_rate": {
            "target": "99.9% successful migrations",
            "measurement": "successful_migrations / total_migration_attempts"
        },
        "bridge_uptime": {
            "target": "99.95% bridge availability",
            "measurement": "bridge_uptime / total_time"
        },
        "transaction_speed": {
            "target": "Average migration time <10 minutes",
            "measurement": "average_migration_completion_time"
        }
    },
    "security_metrics": {
        "security_incidents": {
            "target": "0 critical security incidents",
            "measurement": "count_critical_incidents"
        },
        "rollback_rate": {
            "target": "<0.1% of migrations require rollback",
            "measurement": "rollback_count / total_migrations"
        }
    },
    "community_metrics": {
        "community_satisfaction": {
            "target": "85% positive feedback on migration",
            "measurement": "positive_feedback / total_feedback"
        },
        "support_ticket_resolution": {
            "target": "95% of tickets resolved within 24h",
            "measurement": "resolved_tickets_24h / total_tickets"
        }
    }
}
```

---

*Diese Blockchain-Migration-Strategie gewährleistet sichere, effiziente und nutzerfreundliche Übergänge zwischen allen Blockchain-Phasen von BSN, während Risiken minimiert und Community-Engagement maximiert wird.* 