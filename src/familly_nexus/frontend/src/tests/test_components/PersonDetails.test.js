import React from "react";
import { render } from "@testing-library/react";
import PersonDetails from "../../components/PersonDetails";

test("renders PersonDetails component", () => {
  const person = {
    name: "John Doe",
    birthdate: "1990-01-01",
    description: "Test person",
  };
  const { getByText } = render(<PersonDetails person={person} />);
  expect(getByText("John Doe")).toBeInTheDocument();
  expect(getByText("1990-01-01")).toBeInTheDocument();
  expect(getByText("Test person")).toBeInTheDocument();
});
