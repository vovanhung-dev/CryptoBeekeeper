"""
Script demo để tạo fake attacks cho testing
"""
import requests
import random
import time
from datetime import datetime

API_BASE = 'http://localhost:5000'

ATTACK_SCENARIOS = [
    {
        'name': 'Wallet Creation Attack',
        'endpoint': '/api/wallet/create',
        'method': 'POST',
        'data': {}
    },
    {
        'name': 'Seed Phrase Brute Force',
        'endpoint': '/api/wallet/import',
        'method': 'POST',
        'data': {
            'seed_phrase': 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
        }
    },
    {
        'name': 'Balance Scan',
        'endpoint': '/api/wallet/balance',
        'method': 'GET',
        'params': {
            'address': '0x' + '1' * 40
        }
    },
    {
        'name': 'Transfer Attack',
        'endpoint': '/api/transfer',
        'method': 'POST',
        'data': {
            'from_address': '0x' + '1' * 40,
            'to_address': '0x' + '2' * 40,
            'amount': 1.5
        }
    },
    {
        'name': 'Transaction History Scan',
        'endpoint': '/api/transaction/history',
        'method': 'GET',
        'params': {
            'address': '0x' + '3' * 40
        }
    }
]

def execute_attack(scenario, delay=0.5):
    """Execute một attack scenario"""
    print(f"\n[ATTACK] Thuc hien: {scenario['name']}")

    try:
        url = API_BASE + scenario['endpoint']

        if scenario['method'] == 'GET':
            response = requests.get(url, params=scenario.get('params', {}))
        elif scenario['method'] == 'POST':
            response = requests.post(url, json=scenario.get('data', {}))
        else:
            print(f"  [ERROR] Unsupported method: {scenario['method']}")
            return False

        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.json()}")

        time.sleep(delay)
        return True

    except Exception as e:
        print(f"  [ERROR] Loi: {str(e)}")
        return False

def run_demo(rounds=3, delay=0.5):
    """Chạy demo attacks"""

    print("="*60)
    print("CRYPTOBEEKEEPER - DEMO ATTACK SIMULATION")
    print("="*60)
    print(f"Thoi gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"So vong: {rounds}")
    print(f"Delay: {delay}s giua cac attacks")
    print("="*60)

    total_attacks = 0
    successful = 0

    for round_num in range(1, rounds + 1):
        print(f"\n{'='*60}")
        print(f"VÒNG {round_num}/{rounds}")
        print(f"{'='*60}")

        # Shuffle scenarios để random
        scenarios = ATTACK_SCENARIOS.copy()
        random.shuffle(scenarios)

        for scenario in scenarios:
            total_attacks += 1
            if execute_attack(scenario, delay):
                successful += 1

    print(f"\n{'='*60}")
    print("KET QUA DEMO")
    print(f"{'='*60}")
    print(f"Tong attacks: {total_attacks}")
    print(f"Thanh cong: {successful}")
    print(f"That bai: {total_attacks - successful}")
    print(f"\n[OK] Demo hoan thanh! Kiem tra dashboard de xem logs.")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Chạy demo attacks cho honeypot')
    parser.add_argument('--rounds', type=int, default=3, help='Số vòng tấn công')
    parser.add_argument('--delay', type=float, default=0.5, help='Delay giữa các attacks (giây)')

    args = parser.parse_args()

    run_demo(args.rounds, args.delay)
