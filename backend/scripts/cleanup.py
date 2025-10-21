"""
Script để cleanup database và logs
"""
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pymongo import MongoClient
from config import Config

def cleanup_database(confirm=True):
    """Xóa tất cả data trong database"""

    if confirm:
        response = input("[WARNING] Ban co chac muon xoa TAT CA du lieu? (yes/no): ")
        if response.lower() != 'yes':
            print("Da huy.")
            return

    print("[INFO] Dang cleanup database...")

    try:
        # Connect to MongoDB
        mongo_client = MongoClient(Config.MONGODB_URI)
        db = mongo_client[Config.MONGODB_DB]

        # Drop collections
        collections = db.list_collection_names()
        for collection in collections:
            db[collection].drop()
            print(f"  [OK] Dropped collection: {collection}")

        print("[OK] Database cleanup hoan tat!")

    except Exception as e:
        print(f"[ERROR] Loi: {str(e)}")

def cleanup_logs():
    """Xóa log files"""

    print("[INFO] Dang cleanup log files...")

    logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')

    if os.path.exists(logs_dir):
        for file in os.listdir(logs_dir):
            if file.endswith('.log'):
                file_path = os.path.join(logs_dir, file)
                os.remove(file_path)
                print(f"  [OK] Deleted: {file}")

        print("[OK] Logs cleanup hoan tat!")
    else:
        print("[WARNING] Thu muc logs khong ton tai")

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Cleanup database và logs')
    parser.add_argument('--db', action='store_true', help='Cleanup database')
    parser.add_argument('--logs', action='store_true', help='Cleanup log files')
    parser.add_argument('--all', action='store_true', help='Cleanup cả database và logs')
    parser.add_argument('--no-confirm', action='store_true', help='Không hỏi xác nhận')

    args = parser.parse_args()

    if args.all:
        cleanup_database(not args.no_confirm)
        cleanup_logs()
    elif args.db:
        cleanup_database(not args.no_confirm)
    elif args.logs:
        cleanup_logs()
    else:
        print("Sử dụng: python cleanup.py [--db | --logs | --all] [--no-confirm]")
