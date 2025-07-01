import { Redis } from "@upstash/redis";

export const redisClient = new Redis({
  url: "https://classic-shark-36617.upstash.io"!,
  token: "AY8JAAIjcDE5M2Q4OTY3ZGZiYzU0Mzc2OTdhYTY4MTQxNGZlNTZlY3AxMA"!,
});
