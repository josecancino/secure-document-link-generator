import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.location.origin
Object.defineProperty(window, "location", {
  value: {
    origin: "http://localhost:5173",
  },
  writable: true,
});

// Mock VITE_API_URL if needed
if (!import.meta.env.VITE_API_URL) {
  vi.stubEnv("VITE_API_URL", "http://localhost:3000/api");
}
