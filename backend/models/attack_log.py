from datetime import datetime
from pymongo import MongoClient
from config import Config

class AttackLog:
    """Model cho attack log"""

    def __init__(self, db):
        self.collection = db['attack_logs']
        self._create_indexes()

    def _create_indexes(self):
        """Tạo indexes cho query nhanh"""
        self.collection.create_index('timestamp')
        self.collection.create_index('ip_address')
        self.collection.create_index('attack_type')

    def create(self, data):
        """Tạo attack log mới"""
        log_entry = {
            'timestamp': datetime.utcnow(),
            'ip_address': data.get('ip_address'),
            'method': data.get('method'),
            'endpoint': data.get('endpoint'),
            'headers': data.get('headers', {}),
            'payload': data.get('payload', {}),
            'query_params': data.get('query_params', {}),
            'response_status': data.get('response_status'),
            'attack_type': data.get('attack_type', 'unknown'),
            'user_agent': data.get('user_agent'),
            'geolocation': data.get('geolocation', {}),
        }

        result = self.collection.insert_one(log_entry)
        return str(result.inserted_id)

    def get_all(self, limit=100, skip=0, filters=None):
        """Lấy tất cả logs với pagination và filter"""
        query = {}

        if filters:
            if filters.get('attack_type'):
                query['attack_type'] = filters['attack_type']
            if filters.get('ip_address'):
                query['ip_address'] = filters['ip_address']
            if filters.get('start_date') or filters.get('end_date'):
                query['timestamp'] = {}
                if filters.get('start_date'):
                    query['timestamp']['$gte'] = filters['start_date']
                if filters.get('end_date'):
                    query['timestamp']['$lte'] = filters['end_date']

        logs = list(self.collection.find(query)
                   .sort('timestamp', -1)
                   .skip(skip)
                   .limit(limit))

        # Convert ObjectId to string
        for log in logs:
            log['_id'] = str(log['_id'])

        total = self.collection.count_documents(query)

        return {
            'logs': logs,
            'total': total,
            'page': skip // limit + 1,
            'per_page': limit
        }

    def get_stats(self):
        """Lấy thống kê tổng quan"""
        total_attacks = self.collection.count_documents({})

        # Tấn công hôm nay
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_attacks = self.collection.count_documents({'timestamp': {'$gte': today_start}})

        # Top IP addresses
        top_ips = list(self.collection.aggregate([
            {'$group': {'_id': '$ip_address', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]))

        # Attack types distribution
        attack_types = list(self.collection.aggregate([
            {'$group': {'_id': '$attack_type', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]))

        return {
            'total_attacks': total_attacks,
            'today_attacks': today_attacks,
            'top_ips': top_ips,
            'attack_types': attack_types
        }

    def get_timeline(self, days=7):
        """Lấy timeline tấn công theo ngày"""
        from datetime import timedelta

        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        pipeline = [
            {'$match': {'timestamp': {'$gte': start_date, '$lte': end_date}}},
            {'$group': {
                '_id': {
                    'year': {'$year': '$timestamp'},
                    'month': {'$month': '$timestamp'},
                    'day': {'$dayOfMonth': '$timestamp'}
                },
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]

        timeline = list(self.collection.aggregate(pipeline))

        return timeline

    def delete_old_logs(self, days=90):
        """Xóa logs cũ hơn X ngày"""
        from datetime import timedelta

        cutoff_date = datetime.utcnow() - timedelta(days=days)
        result = self.collection.delete_many({'timestamp': {'$lt': cutoff_date}})

        return result.deleted_count
