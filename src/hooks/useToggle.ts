import { useState, useCallback } from "react";

/**
 * A hook that provides toggle functionality
 * @param initialState - The initial state of the toggle
 * @returns A tuple containing the current state and a function to toggle the state
 */
export const useToggle = (
  initialState: boolean = false
): [boolean, () => void] => {
  const [state, setState] = useState<boolean>(initialState);

  // Memoize the toggle function to avoid unnecessary re-renders
  const toggle = useCallback(() => {
    setState((prevState) => !prevState);
  }, []);

  return [state, toggle];
};

export default useToggle;
