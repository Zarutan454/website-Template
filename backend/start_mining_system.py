#!/usr/bin/env python3
"""
BSN Mining System - Windows-Compatible Startup & Monitoring Script
Startet und überwacht das komplette Mining-System (Django + Celery + Heartbeat)
"""

import os
import sys
import time
import subprocess
import django
from pathlib import Path

# Windows encoding fix
if sys.platform == 'win32':
    import codecs
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except:
        pass

# Setup Django
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from django.utils import timezone
from bsn_social_network.models import User, MiningProgress
from bsn_social_network.services.mining_service import MiningService

def check_celery_worker():
    """Überprüfe ob Celery Worker läuft"""
    try:
        result = subprocess.run([
            sys.executable, '-m', 'celery', '-A', 'bsn', 'status'
        ], capture_output=True, text=True, timeout=10)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_celery_beat():
    """Überprüfe ob Celery Beat läuft"""
    try:
        result = subprocess.run([
            sys.executable, '-m', 'celery', '-A', 'bsn', 'inspect', 'active'
        ], capture_output=True, text=True, timeout=10)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def start_celery_worker():
    """Starte Celery Worker im Hintergrund"""
    try:
        if sys.platform == 'win32':
            # Windows-spezifische Optionen
            cmd = [sys.executable, '-m', 'celery', '-A', 'bsn', 'worker', '--loglevel=info', '--pool=solo']
        else:
            cmd = [sys.executable, '-m', 'celery', '-A', 'bsn', 'worker', '--loglevel=info', '--detach']
        
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"[INFO] Celery Worker started (PID: {process.pid})")
        return True, process
    except Exception as e:
        return False, str(e)

def start_celery_beat():
    """Starte Celery Beat im Hintergrund"""
    try:
        if sys.platform == 'win32':
            cmd = [sys.executable, '-m', 'celery', '-A', 'bsn', 'beat', '--loglevel=info']
        else:
            cmd = [sys.executable, '-m', 'celery', '-A', 'bsn', 'beat', '--loglevel=info', '--detach']
        
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"[INFO] Celery Beat started (PID: {process.pid})")
        return True, process
    except Exception as e:
        return False, str(e)

def get_mining_stats():
    """Hole Mining-Statistiken"""
    try:
        total_users = User.objects.count()
        active_miners = MiningProgress.objects.filter(is_mining=True).count()
        return {
            'total_users': total_users,
            'active_miners': active_miners,
            'status': 'connected'
        }
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

def monitor_sessions():
    """Überwache Mining-Sessions"""
    try:
        report = MiningService.monitor_inactive_sessions()
        return report
    except Exception as e:
        return {'error': str(e)}

def test_heartbeat_system():
    """Teste das Heartbeat-System"""
    print("\n[TEST] TESTING HEARTBEAT SYSTEM")
    print("=" * 40)
    
    try:
        # Teste mit einem existierenden User
        test_user = User.objects.first()
        if not test_user:
            print("[ERROR] No users found for testing")
            return False
            
        print(f"[INFO] Testing with user: {test_user.email}")
        
        # Test 1: Mining Stats
        stats = get_mining_stats()
        print(f"[TEST] Mining stats retrieved: {'OK' if stats.get('status') == 'connected' else 'FAILED'}")
        
        # Test 2: Heartbeat Update
        try:
            MiningService.update_heartbeat(test_user)
            print("[TEST] Heartbeat update: OK")
        except Exception as e:
            print(f"[TEST] Heartbeat update: FAILED ({e})")
            
        # Test 3: Session Monitoring
        try:
            report = monitor_sessions()
            active = report.get('total_active_sessions', 0)
            inactive = report.get('total_inactive_sessions', 0)
            print(f"[TEST] Session monitoring: OK")
            print(f"   - Active sessions: {active}")
            print(f"   - Inactive sessions: {inactive}")
        except Exception as e:
            print(f"[TEST] Session monitoring: FAILED ({e})")
            
        return True
    except Exception as e:
        print(f"[ERROR] Heartbeat test failed: {e}")
        return False

def show_status():
    """Zeige System-Status"""
    print(f"\n[STATUS] BSN MINING SYSTEM STATUS")
    print("=" * 50)
    print(f"[TIME] Check Time: {timezone.now()}")
    
    print(f"\n[DJANGO] DJANGO STATUS")
    stats = get_mining_stats()
    if stats.get('status') == 'connected':
        print(f"   [OK] Django connected")
        print(f"   [INFO] Total users: {stats.get('total_users', 0)}")
        print(f"   [INFO] Active miners: {stats.get('active_miners', 0)}")
    else:
        print(f"   [ERROR] Django connection failed: {stats.get('error', 'Unknown')}")
    
    print(f"\n[CELERY] CELERY WORKER STATUS")
    worker_running, worker_output, worker_error = check_celery_worker()
    if worker_running:
        print("   [OK] Celery Worker running")
    else:
        print("   [ERROR] Celery Worker not running:")
        if worker_error:
            print(f"   [ERROR] {worker_error[:200]}...")
    
    print(f"\n[BEAT] CELERY BEAT STATUS")
    beat_running, beat_output, beat_error = check_celery_beat()
    if beat_running:
        print("   [OK] Celery Beat accessible")
    else:
        print("   [ERROR] Celery Beat not accessible:")
        if beat_error:
            print(f"   [ERROR] {beat_error[:200]}...")
    
    print(f"\n[MINING] MINING SESSIONS MONITORING")
    report = monitor_sessions()
    if 'error' not in report:
        print(f"   [INFO] Active sessions: {report.get('total_active_sessions', 0)}")
        print(f"   [INFO] Inactive sessions: {report.get('total_inactive_sessions', 0)}")
    else:
        print(f"   [ERROR] Monitoring failed: {report['error']}")
    
    print(f"\n[SUMMARY] SYSTEM HEALTH SUMMARY")
    if worker_running and beat_running:
        print("   [OK] Mining system fully operational")
    else:
        print("   [WARNING] Mining system has ISSUES - some components not running")
        print("   [ACTION] Run this script with --start to start missing components")

def start_system():
    """Starte das komplette System"""
    print("[START] Starting BSN Mining System...")
    print("=" * 40)
    
    worker_running, _, _ = check_celery_worker()
    beat_running, _, _ = check_celery_beat()
    
    processes = []
    
    if not worker_running:
        print("[ACTION] Starting Celery Worker...")
        success, result = start_celery_worker()
        if success:
            processes.append(('worker', result))
            time.sleep(2)  # Warte kurz
        else:
            print(f"[ERROR] Failed to start Celery Worker: {result}")
    
    if not beat_running:
        print("[ACTION] Starting Celery Beat...")
        success, result = start_celery_beat()
        if success:
            processes.append(('beat', result))
            time.sleep(2)  # Warte kurz
        else:
            print(f"[ERROR] Failed to start Celery Beat: {result}")
    
    if processes:
        print(f"\n[SUCCESS] Started {len(processes)} processes")
        print("[INFO] System should be operational now")
        print("[INFO] Check status with: python start_mining_system.py --status")
    else:
        print("[INFO] All components were already running")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "--status":
            show_status()
        elif command == "--start":
            start_system()
        elif command == "--test":
            test_heartbeat_system()
        elif command == "--help":
            print("BSN Mining System Manager")
            print("Commands:")
            print("  --status  Show system status")
            print("  --start   Start missing components")
            print("  --test    Test heartbeat system")
            print("  --help    Show this help")
        else:
            print(f"[ERROR] Unknown command: {command}")
            print("Use --help for available commands")
    else:
        show_status() 