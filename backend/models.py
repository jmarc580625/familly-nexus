import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.dialects.postgresql import ARRAY
import psycopg2

DATABASE_URL = os.environ.get('DATABASE_URL')
engine = create_engine(DATABASE_URL)
Base = declarative_base()

class Person(Base):
    __tablename__ = 'persons'
    id = Column(Integer, primary_key=True)
    last_name = Column(String)
    first_name = Column(String)
    birthdate = Column(DateTime)
    deathdate = Column(DateTime)
    description = Column(Text)

class Photo(Base):
    __tablename__ = 'photos'
    id = Column(Integer, primary_key=True)
    filename = Column(String)
    upload_date = Column(DateTime)
    uploader = Integer # Store associated person ID
    description = Column(Text)
    location = Column(String) # Store as string for MVP
    date_taken = Column(DateTime)
    author = Integer # Store associated person ID
    person_ids = Column(ARRAY(Integer)) # Store associated person IDs as an array
    #person_ids = Column(Integer)
    #persons = relationship("Person", backref="photos")

Base.metadata.create_all(engine)

# Helper function to create a session
def create_session():
    Session = sessionmaker(bind=engine)
    return Session()

# Example usage (for testing):
#session = create_session()
#new_person = Person(name="John Doe", birthdate="2000-01-01")
#session.add(new_person)
#session.commit()
