from datetime import datetime, timezone, date
from typing import Union, Dict, Any
from flask import Blueprint, request, jsonify, send_from_directory
from core.services.service_context import ServiceContext
from core.services.photo_service import PhotoService
from core.services.person_service import PersonService
from core.services.service_exceptions import NotFoundException

# Define upload folder for development only
UPLOAD_FOLDER = 'uploads'

api = Blueprint('api', __name__)
_service_context = None
_photo_service = None
_person_service = None

def get_service_context():
    global _service_context
    if _service_context is None:
        _service_context = ServiceContext()
    return _service_context

def get_photo_service():
    global _photo_service
    if _photo_service is None:
        _photo_service = PhotoService(get_service_context())
    return _photo_service

def get_person_service():
    global _person_service
    if _person_service is None:
        _person_service = PersonService(get_service_context())
    return _person_service

def create_response(
    success: bool,
    data: Union[Dict, None] = None,
    error: Union[Dict, None] = None,
    status_code: int = 200
) -> tuple:
    response = {
        "success": success,
        "timestamp": datetime.now().isoformat()
    }
    
    if data is not None:
        response["data"] = data
    if error is not None:
        response["error"] = error
        
    return jsonify(response), status_code

@api.route("/photos", methods=["POST"])
def upload_photo_route():
    try:
        photo_service = get_photo_service()
        photo_file = request.files.get('photo')
        if not photo_file:
            return create_response(
                success=False, 
                error={
                    "code": "NO_PHOTO_PROVIDED",
                    "message": "No photo provided"
                },
                status_code=400
            )

        # Parse metadata from form data
        metadata = {
            'title': request.form.get('title'),
            'description': request.form.get('description'),
            'tags': request.form.getlist('tags[]'),
            'people': request.form.getlist('people[]'),
            'location': {
                'name': request.form.get('location_name'),
                'latitude': float(request.form.get('latitude')) if request.form.get('latitude') else None,
                'longitude': float(request.form.get('longitude')) if request.form.get('longitude') else None
            } if request.form.get('latitude') and request.form.get('longitude') else None
        }

        result = photo_service.upload_photo(photo_file, metadata)
        return create_response(success=True, data=result)
    except ValueError as e:
        return create_response(
            success=False,
            error={
                "code": "VALIDATION_ERROR",
                "message": str(e)
            },
            status_code=400
        )
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "INTERNAL_ERROR",
                "message": str(e)
            },
            status_code=500
        )

@api.route("/photos", methods=["GET"])
def get_photos_route():
    try:
        photo_service = get_photo_service()
        
        # Parse search criteria from query parameters
        search_criteria = {}
        
        if request.args.getlist('tags[]'):
            search_criteria['tags'] = request.args.getlist('tags[]')
        
        if request.args.getlist('people[]'):
            search_criteria['people'] = [
                int(person_id) for person_id in request.args.getlist('people[]')
            ]
        
        if request.args.get('start_date'):
            search_criteria['start_date'] = datetime.fromisoformat(
                request.args.get('start_date')
            )
        
        if request.args.get('end_date'):
            search_criteria['end_date'] = datetime.fromisoformat(
                request.args.get('end_date')
            )
        
        if request.args.get('location'):
            search_criteria['location'] = request.args.get('location')

        result = photo_service.get_photos(search_criteria)
        return create_response(success=True, data=result)
    except ValueError as e:
        return create_response(
            success=False,
            error={
                "code": "VALIDATION_ERROR",
                "message": str(e)
            },
            status_code=400
        )
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "INTERNAL_ERROR",
                "message": str(e)
            },
            status_code=500
        )

@api.route("/photos/<int:photo_id>", methods=["GET"])
def get_photo_route(photo_id):
    try:
        photo_service = get_photo_service()
        result = photo_service.get_photo(photo_id)
        return create_response(success=True, data=result)
    except ValueError as e:
        return create_response(
            success=False,
            error={
                "code": "NOT_FOUND",
                "message": str(e)
            },
            status_code=404
        )
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "INTERNAL_ERROR",
                "message": str(e)
            },
            status_code=500
        )

@api.route("/photos/tags", methods=["GET"])
def get_tags_route():
    try:
        photo_service = get_photo_service()
        tags = photo_service.get_tags()
        return create_response(success=True, data=tags)
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "INTERNAL_ERROR",
                "message": str(e)
            },
            status_code=500
        )

@api.route("/photos/search", methods=["GET"])
def search_photos_route():
    """
    Search or filter photos based on query parameters.

    This endpoint supports two types of search:
    1. Free-text search: Using the 'q' parameter for searching across all fields
    2. Structured filtering: Using specific criteria parameters

    Query Parameters:
        q (str, optional): Free-text search query
            Example: ?q=Paris vacation
        
        start_date (str, optional): ISO format date to filter photos taken after
            Example: ?start_date=2024-01-01
        
        end_date (str, optional): ISO format date to filter photos taken before
            Example: ?end_date=2024-12-31
        
        tags[] (list[str], optional): List of exact tags to filter by
            Example: ?tags[]=family&tags[]=vacation
        
        people[] (list[int], optional): List of person IDs to filter by
            Example: ?people[]=1&people[]=2
        
        location (str, optional): Location name to filter by
            Example: ?location=Paris

    Returns:
        JSON response containing:
        - success: bool
        - data: List of photo dictionaries
        - error: Error details if success is false

    Examples:
        1. Free-text search:
           GET /api/photos/search?q=Paris vacation
        
        2. Filter by criteria:
           GET /api/photos/search?start_date=2024-01-01&tags[]=family
        
        3. Combined search:
           GET /api/photos/search?q=Paris&tags[]=vacation&start_date=2024-01-01
    """
    try:
        query = request.args.get('q', '')
        
        # Get additional search criteria
        search_criteria = {}
        
        # Add date filters if provided
        if request.args.get('start_date'):
            search_criteria['start_date'] = datetime.fromisoformat(request.args.get('start_date'))
        if request.args.get('end_date'):
            search_criteria['end_date'] = datetime.fromisoformat(request.args.get('end_date'))
            
        # Add tag filters
        if request.args.getlist('tags[]'):
            search_criteria['tags'] = request.args.getlist('tags[]')
            
        # Add people filters
        if request.args.getlist('people[]'):
            search_criteria['people'] = [int(pid) for pid in request.args.getlist('people[]')]
            
        # Add location filter
        if request.args.get('location'):
            search_criteria['location'] = request.args.get('location')

        photo_service = get_photo_service()
        
        # If we have search criteria but no query, use get_photos
        if search_criteria and not query:
            results = photo_service.get_photos(search_criteria)
        # If we have a query, use search_photos
        elif query:
            results = photo_service.search_photos(query)
        # If we have neither, return empty list
        else:
            results = []
            
        return create_response(success=True, data=results)
    except ValueError as e:
        return create_response(
            success=False,
            error={
                "code": "INVALID_PARAMETER",
                "message": str(e)
            },
            status_code=400
        )
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "SEARCH_ERROR",
                "message": str(e)
            },
            status_code=500
        )

@api.route("/uploads/<path:filename>")
def serve_photo(filename):
    """Serve uploaded photos (for development only, use S3 in production)"""
    return send_from_directory(UPLOAD_FOLDER, filename)

@api.route("/persons", methods=["POST"])
def add_person_route():
    try:
        person_service = get_person_service()
        person_data = request.get_json()
        result = person_service.create_person(person_data)
        return create_response(success=True, data=result)
    except ValueError as e:
        return create_response(
            success=False,
            error={
                "code": "VALIDATION_ERROR",
                "message": str(e)
            },
            status_code=400
        )
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "INTERNAL_ERROR",
                "message": str(e)
            },
            status_code=500
        )

@api.route("/persons/<int:person_id>", methods=["PUT"])
def update_person_route(person_id):
    try:
        person_service = get_person_service()
        person_data = request.get_json()
        result = person_service.update_person(person_id, person_data)
        return create_response(success=True, data=result)
    except ValueError as e:
        error_code = "NOT_FOUND" if "not found" in str(e) else "VALIDATION_ERROR"
        status_code = 404 if error_code == "NOT_FOUND" else 400
        return create_response(
            success=False,
            error={
                "code": error_code,
                "message": str(e)
            },
            status_code=status_code
        )
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "INTERNAL_ERROR",
                "message": str(e)
            },
            status_code=500
        )

@api.route("/persons", methods=["GET"])
def get_persons_route():
    try:
        person_service = get_person_service()
        search_criteria = request.args.to_dict()
        result = person_service.get_persons(search_criteria)
        return create_response(success=True, data=result)
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "INTERNAL_ERROR",
                "message": str(e)
            },
            status_code=500
        )

@api.route("/persons/<int:person_id>", methods=["GET"])
def get_person_route(person_id):
    try:
        person_service = get_person_service()
        result = person_service.get_person(person_id)
        return create_response(success=True, data=result)
    except ValueError as e:
        return create_response(
            success=False,
            error={
                "code": "NOT_FOUND",
                "message": str(e)
            },
            status_code=404
        )
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "INTERNAL_ERROR",
                "message": str(e)
            },
            status_code=500
        )

@api.route("/persons/<int:person_id>", methods=["DELETE"])
def delete_person_route(person_id):
    try:
        person_service = get_person_service()
        person_service.delete_person(person_id)
        return create_response(success=True)
    except ValueError as e:
        return create_response(
            success=False,
            error={
                "code": "NOT_FOUND",
                "message": str(e)
            },
            status_code=404
        )
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "INTERNAL_ERROR",
                "message": str(e)
            },
            status_code=500
        )

@api.route("/persons/search", methods=["GET"])
def search_persons_route():
    """
    Search or filter people based on query parameters.

    This endpoint supports two types of search:
    1. Free-text search: Using the 'q' parameter for searching across all fields
    2. Structured filtering: Using specific criteria parameters

    Query Parameters:
        q (str, optional): Free-text search query
            Example: ?q=John Paris
        
        birth_date_start (str, optional): ISO format date to filter people born after
            Example: ?birth_date_start=1950-01-01
        
        birth_date_end (str, optional): ISO format date to filter people born before
            Example: ?birth_date_end=2000-12-31
        
        death_date_start (str, optional): ISO format date to filter people who died after
            Example: ?death_date_start=1990-01-01
        
        death_date_end (str, optional): ISO format date to filter people who died before
            Example: ?death_date_end=2020-12-31
        
        living (bool, optional): Filter only living (true) or deceased (false) people
            Example: ?living=true
        
        related_to (int, optional): Filter by relationship to a specific person ID
            Example: ?related_to=123

    Returns:
        JSON response containing:
        - success: bool
        - data: List of person dictionaries
        - error: Error details if success is false

    Examples:
        1. Free-text search:
           GET /api/persons/search?q=John Paris
        
        2. Filter by criteria:
           GET /api/persons/search?birth_date_start=1950-01-01&living=true
        
        3. Combined search:
           GET /api/persons/search?q=John&birth_date_start=1950-01-01
    """
    try:
        query = request.args.get('q', '')
        
        # Get additional search criteria
        search_criteria = {}
        
        # Add date filters if provided
        if request.args.get('birth_date_start'):
            search_criteria['birth_date_start'] = date.fromisoformat(request.args.get('birth_date_start'))
        if request.args.get('birth_date_end'):
            search_criteria['birth_date_end'] = date.fromisoformat(request.args.get('birth_date_end'))
        if request.args.get('death_date_start'):
            search_criteria['death_date_start'] = date.fromisoformat(request.args.get('death_date_start'))
        if request.args.get('death_date_end'):
            search_criteria['death_date_end'] = date.fromisoformat(request.args.get('death_date_end'))
            
        # Add living filter
        if request.args.get('living') is not None:
            search_criteria['living'] = request.args.get('living').lower() == 'true'
            
        # Add relationship filter
        if request.args.get('related_to'):
            search_criteria['related_to'] = int(request.args.get('related_to'))

        person_service = get_person_service()
        
        # If we have search criteria but no query, use get_people
        if search_criteria and not query:
            results = person_service.get_people(search_criteria)
        # If we have a query, use search_people
        elif query:
            results = person_service.search_people(query)
        # If we have neither, return empty list
        else:
            results = []
            
        return create_response(success=True, data=results)
    except ValueError as e:
        return create_response(
            success=False,
            error={
                "code": "INVALID_PARAMETER",
                "message": str(e)
            },
            status_code=400
        )
    except Exception as e:
        return create_response(
            success=False,
            error={
                "code": "SEARCH_ERROR",
                "message": str(e)
            },
            status_code=500
        )
