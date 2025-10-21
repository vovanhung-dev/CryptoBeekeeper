from flask import Blueprint, request, jsonify
from datetime import datetime

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

# Global variables (sẽ được inject từ app.py)
attack_log_model = None
analyzer_service = None

def init_analytics_routes(attack_log, analyzer):
    """Initialize routes với dependencies"""
    global attack_log_model, analyzer_service
    attack_log_model = attack_log
    analyzer_service = analyzer
    print(f"[DEBUG] Analytics routes initialized - attack_log_model: {attack_log_model}, analyzer_service: {analyzer_service}")


@analytics_bp.route('/test', methods=['GET'])
def test():
    """Test endpoint - không cần database"""
    return jsonify({
        'success': True,
        'message': 'Analytics blueprint is working!',
        'models_loaded': attack_log_model is not None
    }), 200


@analytics_bp.route('/stats', methods=['GET'])
def get_stats():
    """Lấy thống kê tổng quan"""

    if attack_log_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        stats = attack_log_model.get_stats()

        return jsonify({
            'success': True,
            'data': stats
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy thống kê: {str(e)}'
        }), 500


@analytics_bp.route('/attacks', methods=['GET'])
def get_attacks():
    """Lấy danh sách tấn công với pagination và filter"""

    if attack_log_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        # Pagination params
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        skip = (page - 1) * per_page

        # Filter params
        filters = {}

        attack_type = request.args.get('attack_type')
        if attack_type:
            filters['attack_type'] = attack_type

        ip_address = request.args.get('ip')
        if ip_address:
            filters['ip_address'] = ip_address

        # Date range
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if start_date:
            try:
                filters['start_date'] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            except ValueError:
                pass

        if end_date:
            try:
                filters['end_date'] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            except ValueError:
                pass

        # Get data
        result = attack_log_model.get_all(
            limit=per_page,
            skip=skip,
            filters=filters if filters else None
        )

        # Convert datetime to ISO string
        for log in result['logs']:
            if 'timestamp' in log:
                log['timestamp'] = log['timestamp'].isoformat()

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy danh sách tấn công: {str(e)}'
        }), 500


@analytics_bp.route('/top-ips', methods=['GET'])
def get_top_ips():
    """Lấy top IP addresses tấn công nhiều nhất"""

    if attack_log_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        limit = int(request.args.get('limit', 10))

        stats = attack_log_model.get_stats()
        top_ips = stats['top_ips'][:limit]

        return jsonify({
            'success': True,
            'data': top_ips
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy top IPs: {str(e)}'
        }), 500


@analytics_bp.route('/attack-types', methods=['GET'])
def get_attack_types():
    """Lấy phân loại các loại tấn công"""

    if attack_log_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        stats = attack_log_model.get_stats()
        attack_types = stats['attack_types']

        return jsonify({
            'success': True,
            'data': attack_types
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy loại tấn công: {str(e)}'
        }), 500


@analytics_bp.route('/timeline', methods=['GET'])
def get_timeline():
    """Lấy timeline tấn công theo ngày"""

    if attack_log_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        days = int(request.args.get('days', 7))

        timeline = attack_log_model.get_timeline(days=days)

        # Format timeline data
        formatted_timeline = []
        for item in timeline:
            date_info = item['_id']
            formatted_timeline.append({
                'date': f"{date_info['year']}-{date_info['month']:02d}-{date_info['day']:02d}",
                'count': item['count']
            })

        return jsonify({
            'success': True,
            'data': formatted_timeline
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy timeline: {str(e)}'
        }), 500


@analytics_bp.route('/ip-analysis/<ip_address>', methods=['GET'])
def analyze_ip(ip_address):
    """Phân tích hành vi của một IP"""

    if analyzer_service is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        hours = int(request.args.get('hours', 24))

        analysis = analyzer_service.analyze_ip_behavior(ip_address, hours=hours)

        return jsonify({
            'success': True,
            'data': analysis
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi phân tích IP: {str(e)}'
        }), 500


@analytics_bp.route('/trends', methods=['GET'])
def get_trends():
    """Lấy xu hướng tấn công"""

    if analyzer_service is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        days = int(request.args.get('days', 7))

        trends = analyzer_service.get_attack_trends(days=days)

        return jsonify({
            'success': True,
            'data': trends
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy xu hướng: {str(e)}'
        }), 500


@analytics_bp.route('/tools', methods=['GET'])
def get_attack_tools():
    """Phân tích công cụ tấn công từ User-Agent"""

    if attack_log_model is None or analyzer_service is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        # Lấy tất cả logs (giới hạn)
        result = attack_log_model.get_all(limit=1000)

        # Phân tích User-Agents
        user_agents = [log.get('user_agent', 'Unknown') for log in result['logs']]

        tool_counts = {}
        for ua in user_agents:
            tool_name = analyzer_service.identify_attack_tools(ua)
            tool_counts[tool_name] = tool_counts.get(tool_name, 0) + 1

        # Convert to list and sort
        tools_list = [{'tool': tool, 'count': count} for tool, count in tool_counts.items()]
        tools_list.sort(key=lambda x: x['count'], reverse=True)

        return jsonify({
            'success': True,
            'data': tools_list
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi phân tích công cụ: {str(e)}'
        }), 500


@analytics_bp.route('/export', methods=['GET'])
def export_logs():
    """Export logs ra CSV format"""

    if attack_log_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        # Get filters
        filters = {}

        attack_type = request.args.get('attack_type')
        if attack_type:
            filters['attack_type'] = attack_type

        # Get data
        result = attack_log_model.get_all(
            limit=10000,  # Max export
            filters=filters if filters else None
        )

        # Convert to CSV format
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow([
            'Timestamp',
            'IP Address',
            'Method',
            'Endpoint',
            'Attack Type',
            'User Agent',
            'Country'
        ])

        # Data
        for log in result['logs']:
            writer.writerow([
                log['timestamp'].isoformat() if 'timestamp' in log else '',
                log.get('ip_address', ''),
                log.get('method', ''),
                log.get('endpoint', ''),
                log.get('attack_type', ''),
                log.get('user_agent', ''),
                log.get('geolocation', {}).get('country', '')
            ])

        csv_data = output.getvalue()

        return jsonify({
            'success': True,
            'data': {
                'csv': csv_data,
                'total_records': len(result['logs'])
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi export: {str(e)}'
        }), 500
