import { Mastra } from "@mastra/core";
import { movieAgent } from "./agent";

export const mastra = new Mastra({
  agents: {
    movieAgent,
  },
});

export { movieAgent };
export * from "./tools";
