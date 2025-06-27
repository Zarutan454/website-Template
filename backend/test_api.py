#!/usr/bin/env python
"""
BSN API Test Script
Tests all major API endpoints to ensure they work correctly
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = 'http://localhost:8000/api'

class BSNAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_data = None
        
    def print_result(self, test_name, success, message="", data=None):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if message:
            print(f"   {message}")
        if data and isinstance(data, dict):
            print(f"   Data: {json.dumps(data, indent=2)[:200]}...")
        print()
    
    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(time.time())
        test_user = {
            'username': f'testuser_{timestamp}',
            'email': f'test_{timestamp}@example.com',
            'password': 'testpassword123',
            'password_confirm': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        response = self.session.post(f'{BASE_URL}/auth/register/', json=test_user)
        
        if response.status_code == 201:
            data = response.json()
            self.access_token = data['tokens']['access']
            self.user_data = data['user']
            self.session.headers.update({'Authorization': f'Bearer {self.access_token}'})
            self.print_result("User Registration", True, f"User created: {self.user_data['username']}", data)
            return True
        else:
            self.print_result("User Registration", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_user_login(self):
        """Test user login"""
        if not self.user_data:
            return False
            
        login_data = {
            'username': self.user_data['username'],
            'password': 'testpassword123'
        }
        
        response = self.session.post(f'{BASE_URL}/auth/login/', json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data['tokens']['access']
            self.session.headers.update({'Authorization': f'Bearer {self.access_token}'})
            self.print_result("User Login", True, "Login successful", data)
            return True
        else:
            self.print_result("User Login", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_user_profile(self):
        """Test user profile retrieval"""
        response = self.session.get(f'{BASE_URL}/auth/profile/')
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("User Profile", True, "Profile retrieved successfully", data)
            return True
        else:
            self.print_result("User Profile", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_wallet(self):
        """Test wallet endpoint"""
        response = self.session.get(f'{BASE_URL}/wallet/')
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("Wallet", True, f"Balance: {data.get('balance', 0)}", data)
            return True
        else:
            self.print_result("Wallet", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_mining_progress(self):
        """Test mining progress endpoint"""
        response = self.session.get(f'{BASE_URL}/mining/')
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("Mining Progress", True, f"Mining Power: {data.get('mining_power', 0)}", data)
            return True
        else:
            self.print_result("Mining Progress", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_alpha_access_request(self):
        """Test alpha access request"""
        alpha_request = {
            'reason': 'investment',
            'investment_amount': 150.00
        }
        
        response = self.session.post(f'{BASE_URL}/auth/request-alpha-access/', json=alpha_request)
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("Alpha Access Request", True, data.get('message', 'Success'), data)
            return True
        else:
            self.print_result("Alpha Access Request", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_posts(self):
        """Test posts endpoint"""
        # First try to get posts
        response = self.session.get(f'{BASE_URL}/posts/')
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("Posts List", True, f"Found {len(data.get('results', []))} posts", data)
            
            # Try to create a post
            new_post = {
                'content': 'This is a test post from the API test script!'
            }
            
            create_response = self.session.post(f'{BASE_URL}/posts/', json=new_post)
            
            if create_response.status_code == 201:
                post_data = create_response.json()
                self.print_result("Post Creation", True, "Post created successfully", post_data)
                return True
            else:
                self.print_result("Post Creation", False, f"Status: {create_response.status_code}, Error: {create_response.text}")
                return False
        else:
            self.print_result("Posts List", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_groups(self):
        """Test groups endpoint"""
        response = self.session.get(f'{BASE_URL}/groups/')
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("Groups List", True, f"Found {len(data.get('results', []))} groups", data)
            
            # Try to create a group
            new_group = {
                'name': 'Test Group',
                'description': 'A test group created by the API test script',
                'privacy': 'public'
            }
            
            create_response = self.session.post(f'{BASE_URL}/groups/', json=new_group)
            
            if create_response.status_code == 201:
                group_data = create_response.json()
                self.print_result("Group Creation", True, "Group created successfully", group_data)
                return True
            else:
                self.print_result("Group Creation", False, f"Status: {create_response.status_code}, Error: {create_response.text}")
                return False
        else:
            self.print_result("Groups List", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_daos(self):
        """Test DAOs endpoint"""
        response = self.session.get(f'{BASE_URL}/daos/')
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("DAOs List", True, f"Found {len(data.get('results', []))} DAOs", data)
            
            # Try to create a DAO
            new_dao = {
                'name': 'Test DAO',
                'description': 'A test DAO created by the API test script',
                'governance_token': 'TEST',
                'status': 'active'
            }
            
            create_response = self.session.post(f'{BASE_URL}/daos/', json=new_dao)
            
            if create_response.status_code == 201:
                dao_data = create_response.json()
                self.print_result("DAO Creation", True, "DAO created successfully", dao_data)
                return True
            else:
                self.print_result("DAO Creation", False, f"Status: {create_response.status_code}, Error: {create_response.text}")
                return False
        else:
            self.print_result("DAOs List", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_ico_reservation(self):
        """Test ICO reservation"""
        reservation_data = {
            'amount_usd': 100.00,
            'payment_method': 'ethereum'
        }
        
        response = self.session.post(f'{BASE_URL}/ico/reserve/', json=reservation_data)
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("ICO Reservation", True, "Reservation created successfully", data)
            return True
        else:
            self.print_result("ICO Reservation", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_notifications(self):
        """Test notifications endpoint"""
        response = self.session.get(f'{BASE_URL}/notifications/')
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("Notifications", True, f"Found {len(data.get('results', []))} notifications", data)
            return True
        else:
            self.print_result("Notifications", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def test_settings(self):
        """Test user settings endpoints"""
        # Test user settings
        response = self.session.get(f'{BASE_URL}/settings/')
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("User Settings", True, "Settings retrieved successfully", data)
        else:
            self.print_result("User Settings", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
        
        # Test notification settings
        response = self.session.get(f'{BASE_URL}/settings/notifications/')
        
        if response.status_code == 200:
            data = response.json()
            self.print_result("Notification Settings", True, "Notification settings retrieved successfully", data)
            return True
        else:
            self.print_result("Notification Settings", False, f"Status: {response.status_code}, Error: {response.text}")
            return False
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting BSN API Tests")
        print("=" * 50)
        print()
        
        tests = [
            self.test_user_registration,
            self.test_user_login,
            self.test_user_profile,
            self.test_wallet,
            self.test_mining_progress,
            self.test_alpha_access_request,
            self.test_posts,
            self.test_groups,
            self.test_daos,
            self.test_ico_reservation,
            self.test_notifications,
            self.test_settings,
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                self.print_result(test.__name__, False, f"Exception: {str(e)}")
        
        print("=" * 50)
        print(f"🏁 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! API is working correctly.")
        else:
            print(f"⚠️  {total - passed} tests failed. Check the output above for details.")
        
        return passed == total

if __name__ == "__main__":
    tester = BSNAPITester()
    tester.run_all_tests() 