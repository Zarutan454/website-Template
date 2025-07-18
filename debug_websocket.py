#!/usr/bin/env python3
"""
WebSocket Debug Script
Tests WebSocket connections to Django backend
"""

import asyncio
import websockets
import json
import sys

async def test_websocket():
    """Test WebSocket connection to Django backend"""
    uri = "ws://localhost:8000/ws/feed/"
    
    try:
        print(f"Connecting to {uri}...")
        async with websockets.connect(uri) as websocket:
            print("✓ WebSocket connection established!")
            
            # Send test message
            test_message = {
                "type": "subscribe_feed",
                "feed_type": "following"
            }
            
            print(f"Sending message: {json.dumps(test_message)}")
            await websocket.send(json.dumps(test_message))
            
            # Wait for response
            print("Waiting for response...")
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            print(f"✓ Received response: {response}")
            
            # Send another test message
            test_message2 = {
                "type": "feed_preferences",
                "preferences": {
                    "show_likes": True,
                    "show_comments": True
                }
            }
            
            print(f"Sending second message: {json.dumps(test_message2)}")
            await websocket.send(json.dumps(test_message2))
            
            # Wait for another response
            response2 = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            print(f"✓ Received second response: {response2}")
            
    except websockets.exceptions.ConnectionRefused:
        print("✗ Connection refused. Is Django server running on port 8000?")
        print("  Try: cd backend && python manage.py runserver 8000")
        return False
    except asyncio.TimeoutError:
        print("✗ Timeout waiting for response")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    return True

async def test_notification_websocket():
    """Test notification WebSocket connection"""
    uri = "ws://localhost:8000/ws/notifications/"
    
    try:
        print(f"\nTesting notification WebSocket: {uri}")
        async with websockets.connect(uri) as websocket:
            print("✓ Notification WebSocket connection established!")
            
            # Send test message
            test_message = {
                "type": "notification_preferences",
                "preferences": {
                    "email_notifications": True,
                    "push_notifications": True
                }
            }
            
            print(f"Sending notification message: {json.dumps(test_message)}")
            await websocket.send(json.dumps(test_message))
            
            # Wait for response
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            print(f"✓ Received notification response: {response}")
            
    except Exception as e:
        print(f"✗ Notification WebSocket error: {e}")
        return False
    
    return True

async def main():
    """Main function"""
    print("🔧 WebSocket Debug Tool")
    print("=" * 50)
    
    # Test feed WebSocket
    feed_success = await test_websocket()
    
    # Test notification WebSocket
    notification_success = await test_notification_websocket()
    
    print("\n" + "=" * 50)
    if feed_success and notification_success:
        print("✅ All WebSocket tests passed!")
        return 0
    else:
        print("❌ Some WebSocket tests failed!")
        return 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        sys.exit(1) 