// Shared utilities
import { z } from "zod";

export const generateSlug = () => Math.random().toString(36).substring(2, 10);
