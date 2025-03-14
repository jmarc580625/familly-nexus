from typing import Dict, Any, List
from datetime import date
from flask_sqlalchemy import SQLAlchemy
from familly_nexus.backend.services.service_context import ServiceContext
from familly_nexus.backend.services.service_exceptions import NotFoundException
from familly_nexus.backend.models.person import Person

class PersonService:
    def __init__(self, context: ServiceContext):
        self.db = context.db

    def create_person(self, person_data: Dict[str, Any]) -> tuple[bool, Dict[str, str]]:
        try:
            new_person = Person(**person_data)
            self.db.session.add(new_person)
            self.db.session.commit()
        except Exception as e:
            self.db.session.rollback()
            raise Exception(f"Failed to create person: {str(e)}")

    def get_persons(self, search_criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            persons = Person.query.filter_by(**search_criteria).all()
            return [person.to_dict() for person in persons]
        except Exception as e:
            raise Exception(f"Failed to get persons: {str(e)}")

    def update_person(self, person_id: int, person_data: Dict[str, Any]) -> Dict[str, str]:
        try:
            person = Person.query.get(person_id)
            if not person:
                raise NotFoundException(f"Person with id {person_id} not found")

            for key, value in person_data.items():
                setattr(person, key, value)
            self.db.session.commit()
        except Exception as e:
            self.db.session.rollback()
            raise Exception(f"Failed to update person: {str(e)}")

    def delete_person(self, person_id: int) -> None:
        try:
            person = Person.query.get(person_id)
            if not person:
                raise NotFoundException(f"Person with id {person_id} not found")
            
            self.db.session.delete(person)
            self.db.session.commit()
        except Exception as e:
            self.db.session.rollback()
            raise Exception(f"Failed to delete person: {str(e)}")
