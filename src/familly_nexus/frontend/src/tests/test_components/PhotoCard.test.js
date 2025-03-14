import React from "react";
import { render } from "@testing-library/react";
import PhotoCard from "../../components/PhotoCard";

test("renders PhotoCard component", () => {
  const photo = {
    filename: "test.jpg",
    description: "Test photo",
    upload_date: "2023-01-01",
  };
  const { getByText } = render(<PhotoCard photo={photo} />);
  expect(getByText("Test photo")).toBeInTheDocument();
  expect(getByText("2023-01-01")).toBeInTheDocument();
});
