from flask import Blueprint, request, jsonify
from datetime import datetime

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')

# Global variables
db = None
settings_collection = None

def init_settings_routes(database):
    """Initialize routes with database"""
    global db, settings_collection
    db = database
    if db is not None:
        settings_collection = db['settings']
        # Tao default settings neu chua co
        _ensure_default_settings()


def _ensure_default_settings():
    """Dam bao co default settings trong database"""
    if settings_collection is None:
        return

    existing = settings_collection.find_one({'_id': 'app_settings'})
    if not existing:
        default_settings = {
            '_id': 'app_settings',
            'database': {
                'log_retention_days': 90
            },
            'honeypot': {
                'fake_wallet_count': 10,
                'min_fake_balance': 0.1,
                'max_fake_balance': 5.0
            },
            'notifications': {
                'email_on_dangerous_attack': True,
                'notify_repeated_ip': False,
                'daily_report': True
            },
            'export': {
                'default_format': 'csv'
            },
            'updated_at': datetime.utcnow()
        }
        settings_collection.insert_one(default_settings)


@settings_bp.route('', methods=['GET'])
def get_settings():
    """Lay tat ca settings"""

    if settings_collection is None:
        return jsonify({
            'success': False,
            'message': 'Database chua duoc ket noi'
        }), 503

    try:
        settings = settings_collection.find_one({'_id': 'app_settings'})

        if not settings:
            _ensure_default_settings()
            settings = settings_collection.find_one({'_id': 'app_settings'})

        # Remove _id field for response
        if settings:
            settings.pop('_id', None)
            if 'updated_at' in settings:
                settings['updated_at'] = settings['updated_at'].isoformat()

        return jsonify({
            'success': True,
            'data': settings
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Loi lay settings: {str(e)}'
        }), 500


@settings_bp.route('', methods=['POST'])
def save_settings():
    """Luu settings"""

    if settings_collection is None:
        return jsonify({
            'success': False,
            'message': 'Database chua duoc ket noi'
        }), 503

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'message': 'Khong co du lieu'
            }), 400

        # Validate settings
        validated_settings = _validate_settings(data)

        # Update settings
        validated_settings['updated_at'] = datetime.utcnow()

        settings_collection.update_one(
            {'_id': 'app_settings'},
            {'$set': validated_settings},
            upsert=True
        )

        return jsonify({
            'success': True,
            'message': 'Luu cai dat thanh cong'
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Loi luu settings: {str(e)}'
        }), 500


def _validate_settings(data):
    """Validate va clean settings data"""
    validated = {}

    # Database settings
    if 'database' in data:
        db_settings = data['database']
        validated['database'] = {}

        if 'log_retention_days' in db_settings:
            days = int(db_settings['log_retention_days'])
            if days < 1 or days > 365:
                raise ValueError('Thoi gian luu tru phai tu 1 den 365 ngay')
            validated['database']['log_retention_days'] = days

    # Honeypot settings
    if 'honeypot' in data:
        hp_settings = data['honeypot']
        validated['honeypot'] = {}

        if 'fake_wallet_count' in hp_settings:
            count = int(hp_settings['fake_wallet_count'])
            if count < 1 or count > 100:
                raise ValueError('So luong fake wallets phai tu 1 den 100')
            validated['honeypot']['fake_wallet_count'] = count

        if 'min_fake_balance' in hp_settings:
            min_bal = float(hp_settings['min_fake_balance'])
            if min_bal < 0:
                raise ValueError('Balance toi thieu phai >= 0')
            validated['honeypot']['min_fake_balance'] = min_bal

        if 'max_fake_balance' in hp_settings:
            max_bal = float(hp_settings['max_fake_balance'])
            if max_bal < 0:
                raise ValueError('Balance toi da phai >= 0')
            validated['honeypot']['max_fake_balance'] = max_bal

    # Notifications settings
    if 'notifications' in data:
        notif_settings = data['notifications']
        validated['notifications'] = {}

        if 'email_on_dangerous_attack' in notif_settings:
            validated['notifications']['email_on_dangerous_attack'] = bool(notif_settings['email_on_dangerous_attack'])

        if 'notify_repeated_ip' in notif_settings:
            validated['notifications']['notify_repeated_ip'] = bool(notif_settings['notify_repeated_ip'])

        if 'daily_report' in notif_settings:
            validated['notifications']['daily_report'] = bool(notif_settings['daily_report'])

    # Export settings
    if 'export' in data:
        export_settings = data['export']
        validated['export'] = {}

        if 'default_format' in export_settings:
            format_val = export_settings['default_format']
            if format_val not in ['csv', 'json', 'pdf']:
                raise ValueError('Dinh dang xuat khong hop le')
            validated['export']['default_format'] = format_val

    return validated


@settings_bp.route('/database', methods=['GET'])
def get_database_settings():
    """Lay database settings"""

    if settings_collection is None:
        return jsonify({
            'success': False,
            'message': 'Database chua duoc ket noi'
        }), 503

    try:
        settings = settings_collection.find_one({'_id': 'app_settings'})

        return jsonify({
            'success': True,
            'data': settings.get('database', {}) if settings else {}
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Loi: {str(e)}'
        }), 500


@settings_bp.route('/honeypot', methods=['GET'])
def get_honeypot_settings():
    """Lay honeypot settings"""

    if settings_collection is None:
        return jsonify({
            'success': False,
            'message': 'Database chua duoc ket noi'
        }), 503

    try:
        settings = settings_collection.find_one({'_id': 'app_settings'})

        return jsonify({
            'success': True,
            'data': settings.get('honeypot', {}) if settings else {}
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Loi: {str(e)}'
        }), 500
