from typing import Dict, Any, List, Optional
from datetime import date, datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
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

    def get_people(self, search_criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Get people based on structured search criteria.
        
        This method is optimized for filtering people using exact criteria such as birth dates,
        death dates, and relationships. It performs exact matches and is ideal for filtering through
        UI components like date pickers, relationship selectors, etc.
        
        Args:
            search_criteria: Dictionary containing:
                - birth_date_start: date - Filter people born after this date
                - birth_date_end: date - Filter people born before this date
                - death_date_start: date - Filter people who died after this date
                - death_date_end: date - Filter people who died before this date
                - living: bool - Filter only living people if True, deceased if False
                - related_to: int - Person ID to filter by relationship
        
        Returns:
            List of person dictionaries matching all the provided criteria
        
        Example:
            >>> criteria = {
            ...     'birth_date_start': date(1950, 1, 1),
            ...     'birth_date_end': date(2000, 12, 31),
            ...     'living': True
            ... }
            >>> people = person_service.get_people(criteria)
        """
        try:
            query = self.db.session.query(Person)

            if 'birth_date_start' in search_criteria:
                query = query.filter(Person.birth_date >= search_criteria['birth_date_start'])

            if 'birth_date_end' in search_criteria:
                query = query.filter(Person.birth_date <= search_criteria['birth_date_end'])

            if 'death_date_start' in search_criteria:
                query = query.filter(Person.death_date >= search_criteria['death_date_start'])

            if 'death_date_end' in search_criteria:
                query = query.filter(Person.death_date <= search_criteria['death_date_end'])

            if 'living' in search_criteria:
                if search_criteria['living']:
                    query = query.filter(Person.death_date.is_(None))
                else:
                    query = query.filter(Person.death_date.isnot(None))

            if 'related_to' in search_criteria:
                # Cette partie nécessiterait une jointure avec la table de relations
                # À implémenter quand la fonctionnalité de relations sera ajoutée
                pass

            # Order by name
            query = query.order_by(Person.first_name, Person.last_name)

            return [person.to_dict() for person in query.all()]

        except Exception as e:
            raise Exception(f"Failed to get people: {str(e)}")

    def search_people(self, query: str) -> List[Dict[str, Any]]:
        """
        Search people using free-text search across multiple fields.
        
        This method performs a fuzzy text search across various person fields including
        name and biography. It's ideal for search bar functionality where users can
        enter any keywords.
        
        The search is:
        - Case-insensitive
        - Matches partial words
        - Searches across multiple fields
        - Supports multiple search terms (space-separated)
        
        Fields searched:
        - Person name
        - Biography
        
        Args:
            query: str - Space-separated search terms
                       Example: "John Paris 1980"
        
        Returns:
            List of person dictionaries matching any of the search terms,
            ordered by name, limited to 50 results
        
        Example:
            >>> people = person_service.search_people("John Paris")
            # Will find people with "John" or "Paris" in their name or biography
        """
        if not query:
            return []

        # Split query into terms for better matching
        terms = [term.strip() for term in query.split() if term.strip()]
        
        # Build the query
        base_query = self.db.session.query(Person).distinct()

        # Add text search conditions
        text_conditions = []
        for term in terms:
            term_pattern = f"%{term}%"
            text_conditions.append(
                or_(
                    Person.first_name.ilike(term_pattern),
                    Person.last_name.ilike(term_pattern),
                    Person.description.ilike(term_pattern)
                )
            )
        
        if text_conditions:
            base_query = base_query.filter(or_(*text_conditions))

        # Order by name and limit results
        people = base_query.order_by(Person.first_name, Person.last_name).limit(50)
        
        return [person.to_dict() for person in people.all()]
