import React, { useEffect, useState } from "react";
import { api, Person } from "../services/api";

export const PersonList: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [newPerson, setNewPerson] = useState<Person>({ name: "" });

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    const data = await api.getPersons();
    setPersons(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createPerson(newPerson);
    setNewPerson({ name: "" });
    loadPersons();
  };

  return (
    <div>
      <h2>Family Members</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newPerson.name}
          onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
          placeholder="Name"
        />
        <button type="submit">Add Person</button>
      </form>

      <ul>
        {persons.map((person) => (
          <li key={person.id}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
};
