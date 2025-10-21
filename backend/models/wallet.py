from datetime import datetime
from pymongo import MongoClient

class Wallet:
    """Model cho fake wallet"""

    def __init__(self, db):
        self.collection = db['wallets']
        self._create_indexes()

    def _create_indexes(self):
        """Tạo indexes"""
        self.collection.create_index('address', unique=True)
        self.collection.create_index('created_at')

    def create(self, data):
        """Tạo wallet mới"""
        wallet_entry = {
            'address': data.get('address'),
            'private_key': data.get('private_key'),
            'seed_phrase': data.get('seed_phrase'),
            'balance': data.get('balance', 0.0),
            'currency': data.get('currency', 'ETH'),
            'created_at': datetime.utcnow(),
            'is_fake': True,
        }

        result = self.collection.insert_one(wallet_entry)
        return str(result.inserted_id)

    def get_by_address(self, address):
        """Lấy wallet theo address"""
        wallet = self.collection.find_one({'address': address})

        if wallet:
            wallet['_id'] = str(wallet['_id'])

        return wallet

    def get_all(self, limit=100, skip=0):
        """Lấy tất cả wallets"""
        wallets = list(self.collection.find()
                      .sort('created_at', -1)
                      .skip(skip)
                      .limit(limit))

        # Convert ObjectId to string
        for wallet in wallets:
            wallet['_id'] = str(wallet['_id'])

        total = self.collection.count_documents({})

        return {
            'wallets': wallets,
            'total': total,
            'page': skip // limit + 1,
            'per_page': limit
        }

    def update_balance(self, address, new_balance):
        """Cập nhật balance của wallet"""
        result = self.collection.update_one(
            {'address': address},
            {'$set': {'balance': new_balance, 'updated_at': datetime.utcnow()}}
        )

        return result.modified_count > 0

    def exists(self, address):
        """Kiểm tra wallet có tồn tại không"""
        return self.collection.count_documents({'address': address}) > 0
