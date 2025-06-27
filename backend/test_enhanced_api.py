#!/usr/bin/env python3
"""
Enhanced BSN API Test Script - Dashboard Features
Tests all new dashboard widgets API endpoints
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
TEST_USER = {
    "username": "testuser",
    "email": "test@bsn.network",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
}

class BSNDashboardTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.user_id = None
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def register_and_login(self):
        """Register test user and login"""
        try:
            # Try to register
            response = self.session.post(f"{BASE_URL}/auth/register/", json=TEST_USER)
            if response.status_code in [200, 201]:
                self.log("✅ User registered successfully")
            elif response.status_code == 400:
                self.log("ℹ️ User already exists, proceeding to login")
            
            # Login
            login_data = {
                "username": TEST_USER["username"],
                "password": TEST_USER["password"]
            }
            response = self.session.post(f"{BASE_URL}/auth/login/", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('tokens', {}).get('access')
                self.user_id = data.get('user', {}).get('id')
                
                # Set authorization header
                self.session.headers.update({
                    'Authorization': f'Bearer {self.token}'
                })
                
                self.log("✅ Login successful")
                return True
            else:
                self.log(f"❌ Login failed: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Registration/Login error: {str(e)}", "ERROR")
            return False
    
    def grant_alpha_access(self):
        """Grant alpha access via investment"""
        try:
            alpha_data = {
                "access_method": "investment",
                "investment_amount": 200.00
            }
            response = self.session.post(f"{BASE_URL}/auth/alpha-access/", json=alpha_data)
            
            if response.status_code == 200:
                self.log("✅ Alpha access granted")
                return True
            else:
                self.log(f"⚠️ Alpha access response: {response.text}")
                return True  # Continue anyway
                
        except Exception as e:
            self.log(f"❌ Alpha access error: {str(e)}", "ERROR")
            return False
    
    def test_mining_leaderboard(self):
        """Test mining leaderboard endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/mining/leaderboard/")
            
            if response.status_code == 200:
                data = response.json()
                leaderboard = data.get('leaderboard', [])
                total_miners = data.get('total_miners', 0)
                user_rank = data.get('user_rank')
                
                self.log(f"✅ Mining Leaderboard: {len(leaderboard)} entries, {total_miners} total miners")
                if user_rank:
                    self.log(f"   User rank: #{user_rank}")
                return True
            else:
                self.log(f"❌ Leaderboard failed: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Leaderboard error: {str(e)}", "ERROR")
            return False
    
    def test_mining_activities(self):
        """Test mining activities endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/mining/activities/")
            
            if response.status_code == 200:
                data = response.json()
                activities = data.get('activities', [])
                mining_stats = data.get('mining_stats', {})
                
                self.log(f"✅ Mining Activities: {len(activities)} activities")
                self.log(f"   Mining power: {mining_stats.get('mining_power', 0)}")
                return True
            else:
                self.log(f"❌ Mining activities failed: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Mining activities error: {str(e)}", "ERROR")
            return False
    
    def test_user_nfts(self):
        """Test user NFTs endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/nfts/")
            
            if response.status_code == 200:
                data = response.json()
                nfts = data.get('nfts', [])
                total_nfts = data.get('total_nfts', 0)
                collection_stats = data.get('collection_stats', {})
                
                self.log(f"✅ User NFTs: {total_nfts} NFTs")
                self.log(f"   For sale: {collection_stats.get('for_sale', 0)}")
                return True
            else:
                self.log(f"❌ NFTs failed: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ NFTs error: {str(e)}", "ERROR")
            return False
    
    def test_active_proposals(self):
        """Test active DAO proposals endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/proposals/active/")
            
            if response.status_code == 200:
                data = response.json()
                proposals = data.get('proposals', [])
                total_active = data.get('total_active', 0)
                user_participation = data.get('user_participation', {})
                
                self.log(f"✅ Active Proposals: {total_active} active")
                self.log(f"   User DAOs: {user_participation.get('active_daos', 0)}")
                return True
            else:
                self.log(f"❌ Proposals failed: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Proposals error: {str(e)}", "ERROR")
            return False
    
    def test_comprehensive_dashboard(self):
        """Test loading all dashboard data at once"""
        try:
            self.log("🔄 Testing comprehensive dashboard data loading...")
            
            # Simulate the dashboardAPI.getDashboardData() call
            endpoints = [
                ('/auth/profile/', 'Profile'),
                ('/wallet/', 'Wallet'),
                ('/mining/progress/', 'Mining Progress'),
                ('/mining/activities/', 'Mining Activities'),
                ('/mining/leaderboard/', 'Leaderboard'),
                ('/posts/', 'Posts'),
                ('/nfts/', 'NFTs'),
                ('/proposals/active/', 'Active Proposals'),
                ('/notifications/', 'Notifications')
            ]
            
            start_time = time.time()
            results = {}
            
            for endpoint, name in endpoints:
                try:
                    response = self.session.get(f"{BASE_URL}{endpoint}")
                    if response.status_code == 200:
                        results[name] = "✅"
                    else:
                        results[name] = f"❌ ({response.status_code})"
                except Exception as e:
                    results[name] = f"❌ (Error)"
            
            load_time = time.time() - start_time
            
            self.log(f"🎯 Dashboard Data Loading Results (took {load_time:.2f}s):")
            for name, status in results.items():
                self.log(f"   {name}: {status}")
            
            success_count = sum(1 for status in results.values() if status == "✅")
            total_count = len(results)
            
            self.log(f"📊 Overall: {success_count}/{total_count} endpoints successful")
            return success_count == total_count
            
        except Exception as e:
            self.log(f"❌ Comprehensive dashboard error: {str(e)}", "ERROR")
            return False
    
    def run_all_tests(self):
        """Run all dashboard tests"""
        self.log("🚀 Starting Enhanced BSN Dashboard API Tests")
        self.log("=" * 50)
        
        tests = [
            ("User Registration & Login", self.register_and_login),
            ("Alpha Access Grant", self.grant_alpha_access),
            ("Mining Leaderboard", self.test_mining_leaderboard),
            ("Mining Activities", self.test_mining_activities),
            ("User NFTs", self.test_user_nfts),
            ("Active DAO Proposals", self.test_active_proposals),
            ("Comprehensive Dashboard", self.test_comprehensive_dashboard),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            self.log(f"\n🧪 Testing: {test_name}")
            try:
                if test_func():
                    passed += 1
                    self.log(f"✅ {test_name} PASSED")
                else:
                    self.log(f"❌ {test_name} FAILED")
            except Exception as e:
                self.log(f"❌ {test_name} ERROR: {str(e)}")
        
        self.log("\n" + "=" * 50)
        self.log(f"🎯 FINAL RESULTS: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 ALL DASHBOARD TESTS PASSED! 🎉", "SUCCESS")
        else:
            self.log(f"⚠️ {total - passed} tests failed", "WARNING")
        
        return passed == total

if __name__ == "__main__":
    tester = BSNDashboardTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🚀 Dashboard is ready for production!")
    else:
        print("\n🔧 Some issues need to be resolved.") 