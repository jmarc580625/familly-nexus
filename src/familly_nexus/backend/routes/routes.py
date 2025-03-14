from datetime import datetime
from typing import Union, Dict, Any
from flask import Blueprint, request, jsonify
from familly_nexus.backend.services.service_context import ServiceContext
from familly_nexus.backend.services.photo_service import PhotoService
from familly_nexus.backend.services.person_service import PersonService

api = Blueprint('api', __name__)
_service_context = None
_photo_service = None
_person_service = None

def get_photo_service():
    global _service_context, _photo_service, _person_service
    if _service_context is None:
        _service_context = ServiceContext()
        _photo_service = PhotoService(_service_context)
    return _photo_service

def get_person_service():
    global _service_context, _photo_service, _person_service
    if _service_context is None:
        _service_context = ServiceContext()
        _person_service = PersonService(_service_context)
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
        description = request.form.get('description', '')
        filename = photo_file.filename
        photo_service.upload_photo(photo_file, filename, description)
        return create_response(success=True, data={"filename": filename})
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
        search_criteria = request.args.to_dict()
        result = photo_service.get_photos(search_criteria)
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

@api.route("/photos/<int:photo_id>", methods=["GET"])
def get_photo_route(photo_id):
    photo_service = get_photo_service()
    # TODO: Implement get_photo in PhotoService
    pass

@api.route("/persons", methods=["POST"])
def add_person_route():
    try:
        person_service = get_person_service()
        person_data = request.json
        person_service.create_person(person_data)
        return create_response(success=True, data=None)
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
        person_data = request.json
        result = person_service.update_person(person_id, person_data)
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

@api.route("/persons", methods=["GET"])
def get_persons_route():
    person_service = get_person_service()
    # TODO: Implement get_persons in PersonService
    pass

@api.route("/persons/<int:person_id>", methods=["GET"])
def get_person_route(person_id):
    person_service = get_person_service()
    # TODO: Implement get_person in PersonService
    pass
