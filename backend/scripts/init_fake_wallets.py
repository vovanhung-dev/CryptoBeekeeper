"""
Script để tạo fake wallets ban đầu cho honeypot
"""
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pymongo import MongoClient
from config import Config
from utils.fake_data import FakeDataGenerator
from models.wallet import Wallet

def init_fake_wallets(count=10):
    """Tạo fake wallets ban đầu"""

    print(f"[INFO] Dang tao {count} fake wallets...")

    try:
        # Connect to MongoDB
        mongo_client = MongoClient(Config.MONGODB_URI)
        db = mongo_client[Config.MONGODB_DB]

        # Test connection
        mongo_client.server_info()
        print(f"[OK] Ket noi MongoDB thanh cong")

        # Initialize wallet model
        wallet_model = Wallet(db)

        # Generate and insert fake wallets
        wallets = FakeDataGenerator.generate_multiple_wallets(count)

        created_count = 0
        for wallet in wallets:
            # Check if wallet already exists
            if not wallet_model.exists(wallet['address']):
                wallet_model.create(wallet)
                created_count += 1
                print(f"  [OK] Created wallet: {wallet['address'][:10]}...{wallet['address'][-8:]}")
            else:
                print(f"  [SKIP] Wallet already exists: {wallet['address'][:10]}...{wallet['address'][-8:]}")

        print(f"\n[OK] Da tao thanh cong {created_count}/{count} fake wallets")

        # Print summary
        all_wallets = wallet_model.get_all(limit=100)
        print(f"\n[INFO] Tong so wallets trong database: {all_wallets['total']}")

    except Exception as e:
        print(f"[ERROR] Loi: {str(e)}")
        return False

    return True

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Tạo fake wallets cho honeypot')
    parser.add_argument('--count', type=int, default=10, help='Số lượng wallets cần tạo')

    args = parser.parse_args()

    init_fake_wallets(args.count)
