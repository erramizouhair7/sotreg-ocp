import raw from "../data/generated-data.json";

// Central place the whole app pulls the demo dataset from.
// Swap this out for a real API call later without touching any page.
export function useData() {
  return raw;
}
