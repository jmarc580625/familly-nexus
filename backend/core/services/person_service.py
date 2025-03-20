from typing import Dict, Any, List, Optional
from datetime import date
from flask_sqlalchemy import SQLAlchemy
from core.services.service_context import ServiceContext
from core.services.service_exceptions import NotFoundException
from core.models.person import Person

class PersonService:
    """Service class for managing person-related operations."""

    def __init__(self, context: ServiceContext):
        """Initialize the PersonService with a ServiceContext.

        Args:
            context: ServiceContext instance providing access to database and other services
        """
        self.db = context.db

    def create_person(self, person_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new person record.

        Args:
            person_data: Dictionary containing person data (first_name, last_name, birth_date, etc.)

        Returns:
            Dict containing the created person's data

        Raises:
            ValueError: If required fields are missing or invalid
            Exception: If database operation fails
        """
        required_fields = ['first_name', 'last_name']
        if not all(field in person_data for field in required_fields):
            raise ValueError(f"Missing required fields: {required_fields}")

        try:
            new_person = Person(**person_data)
            self.db.session.add(new_person)
            self.db.session.commit()
            return new_person.to_dict()
        except Exception as e:
            self.db.session.rollback()
            raise Exception(f"Failed to create person: {str(e)}")

    def get_persons(self, search_criteria: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Get a list of persons, optionally filtered by search criteria.

        Args:
            search_criteria: Optional dictionary of field-value pairs to filter by

        Returns:
            List of dictionaries containing person data

        Raises:
            Exception: If database operation fails
        """
        try:
            query = self.db.session.query(Person)
            if search_criteria:
                # Only apply valid field filters
                valid_filters = {k: v for k, v in search_criteria.items() 
                               if hasattr(Person, k)}
                if valid_filters:
                    query = query.filter_by(**valid_filters)
            persons = query.all()
            return [person.to_dict() for person in persons]
        except Exception as e:
            raise Exception(f"Failed to get persons: {str(e)}")

    def get_person(self, person_id: int) -> Dict[str, Any]:
        """Get a person by their ID.

        Args:
            person_id: ID of the person to retrieve

        Returns:
            Dictionary containing the person's data

        Raises:
            ValueError: If person is not found
            Exception: If database operation fails
        """
        try:
            person = self.db.session.get(Person, person_id)
            if not person:
                raise ValueError(f"Person with id {person_id} not found")
            return person.to_dict()
        except ValueError as e:
            raise e
        except Exception as e:
            raise Exception(f"Failed to get person: {str(e)}")

    def update_person(self, person_id: int, person_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing person's data.

        Args:
            person_id: ID of the person to update
            person_data: Dictionary containing fields to update

        Returns:
            Dictionary containing the updated person's data

        Raises:
            ValueError: If person is not found or if data is invalid
            Exception: If database operation fails
        """
        try:
            person = self.db.session.get(Person, person_id)
            if not person:
                raise ValueError(f"Person with id {person_id} not found")

            # Only update valid fields
            valid_updates = {k: v for k, v in person_data.items() 
                           if hasattr(Person, k)}
            if not valid_updates:
                raise ValueError("No valid fields to update")

            for key, value in valid_updates.items():
                setattr(person, key, value)
            
            self.db.session.commit()
            return person.to_dict()
        except ValueError as e:
            self.db.session.rollback()
            raise e
        except Exception as e:
            self.db.session.rollback()
            raise Exception(f"Failed to update person: {str(e)}")

    def delete_person(self, person_id: int) -> bool:
        """Delete a person by their ID.

        Args:
            person_id: ID of the person to delete

        Returns:
            True if person was successfully deleted

        Raises:
            ValueError: If person is not found
            Exception: If database operation fails
        """
        try:
            person = self.db.session.get(Person, person_id)
            if not person:
                raise ValueError(f"Person with id {person_id} not found")
            
            self.db.session.delete(person)
            self.db.session.commit()
            return True
        except ValueError as e:
            self.db.session.rollback()
            raise e
        except Exception as e:
            self.db.session.rollback()
            raise Exception(f"Failed to delete person: {str(e)}")
