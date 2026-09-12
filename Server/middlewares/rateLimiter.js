import { rateLimit } from "express-rate-limit";

export const registerlimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour (60 mins)
  limit: 3, // Limit each IP to 3 requests per `window` (here, per 60 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  message: { error: "Too many requests, please try again later." },
  handler: (req, res, next, options) =>
    res.status(options.statusCode).send(options.message),
  // store: ... , // Redis, Memcached, etc. See below.
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  message: { error: "Too many requests, please try again later." },
  handler: (req, res, next, options) =>
    res.status(options.statusCode).send(options.message),
  // store: ... , // Redis, Memcached, etc. See below.
});
