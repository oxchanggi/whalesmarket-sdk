import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../src/components/Button";

describe("Button Component", () => {
  test("renders button with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("renders different variants", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    const button = screen.getByText("Primary");

    // Check primary variant
    expect(button).toHaveClass("bg-blue-600");

    // Check secondary variant
    rerender(<Button variant="secondary">Primary</Button>);
    expect(button).toHaveClass("bg-gray-600");

    // Check outline variant
    rerender(<Button variant="outline">Primary</Button>);
    expect(button).toHaveClass("bg-transparent");
  });
});
