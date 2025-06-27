#!/usr/bin/env python3
import requests
import json
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import time

def create_test_image():
    """Create a test image for testing"""
    # Create a simple test image
    img = Image.new('RGB', (400, 300), color='red')
    draw = ImageDraw.Draw(img)
    
    # Add some text
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    draw.text((200, 150), "TEST IMAGE", fill='white', anchor="mm", font=font)
    draw.text((200, 180), "Generated for API Testing", fill='white', anchor="mm", font=font)
    
    # Save to bytes
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

def test_login():
    """Test login and get token"""
    print("🔐 Testing login...")
    
    login_data = {
        "email": "test@bsn.network",
        "password": "TestPass123!"
    }
    
    try:
        response = requests.post('http://localhost:8000/api/auth/login/', json=login_data)
        print(f"Login response status: {response.status_code}")
        print(f"Login response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            return data.get('access')
        else:
            print("❌ Login failed")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_media_upload(token):
    """Test media upload"""
    print("\n📤 Testing media upload...")
    
    # Create test image
    img_bytes = create_test_image()
    
    files = {
        'file': ('test-image.png', img_bytes, 'image/png')
    }
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/upload/media/', files=files, headers=headers)
        print(f"Media upload response status: {response.status_code}")
        print(f"Media upload response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            return data.get('url')
        else:
            print("❌ Media upload failed")
            return None
    except Exception as e:
        print(f"❌ Media upload error: {e}")
        return None

def test_post_creation(token, media_url=None):
    """Test post creation with and without media"""
    print(f"\n📝 Testing post creation...")
    
    # Test 1: Post without media
    print("Test 1: Post without media")
    post_data = {
        "content": "Test post without media - " + str(int(time.time())),
        "hashtags": ["test", "api"]
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/posts/', json=post_data, headers=headers)
        print(f"Post without media response status: {response.status_code}")
        print(f"Post without media response: {response.text}")
        
        if response.status_code != 201:
            print("❌ Post without media failed")
    except Exception as e:
        print(f"❌ Post without media error: {e}")
    
    # Test 2: Post with media (if available)
    if media_url:
        print("\nTest 2: Post with media")
        post_data_with_media = {
            "content": "Test post with media - " + str(int(time.time())),
            "media_url": media_url,
            "media_type": "image",
            "hashtags": ["test", "media", "api"]
        }
        
        print(f"Sending post data: {json.dumps(post_data_with_media, indent=2)}")
        
        try:
            response = requests.post('http://localhost:8000/api/posts/', json=post_data_with_media, headers=headers)
            print(f"Post with media response status: {response.status_code}")
            print(f"Post with media response: {response.text}")
            
            if response.status_code == 201:
                print("✅ Post with media successful!")
            else:
                print("❌ Post with media failed")
        except Exception as e:
            print(f"❌ Post with media error: {e}")
    
    # Test 3: Post with media as array (simulate the bug)
    print("\nTest 3: Post with media as array (simulating the bug)")
    post_data_array = {
        "content": "Test post with media array - " + str(int(time.time())),
        "media_url": [media_url] if media_url else ["test-url"],
        "media_type": "image",
        "hashtags": ["test", "array", "bug"]
    }
    
    print(f"Sending post data with array: {json.dumps(post_data_array, indent=2)}")
    
    try:
        response = requests.post('http://localhost:8000/api/posts/', json=post_data_array, headers=headers)
        print(f"Post with media array response status: {response.status_code}")
        print(f"Post with media array response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Post with media array successful! (This should fail)")
        else:
            print("❌ Post with media array failed (expected)")
    except Exception as e:
        print(f"❌ Post with media array error: {e}")

def main():
    print("🧪 Starting comprehensive API test...")
    
    # Test login
    token = test_login()
    if not token:
        print("❌ Cannot proceed without valid token")
        return
    
    print(f"✅ Login successful, token: {token[:20]}...")
    
    # Test media upload
    media_url = test_media_upload(token)
    if media_url:
        print(f"✅ Media upload successful: {media_url}")
    else:
        print("⚠️ Media upload failed, testing post creation without media")
    
    # Test post creation
    test_post_creation(token, media_url)
    
    print("\n🏁 Test completed!")

if __name__ == "__main__":
    main() 