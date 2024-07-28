const morgan = require("morgan");

const logger = require("./logger");

morgan.token("protocol", (req) => req.protocol || "-");
morgan.token("user-agent", (req) => req.headers["user-agent"]);
morgan.token("referer", (req) => req.headers["referer"] || "-");
morgan.token("remote-addr", (req) => req.headers["x-real-ip"] || req.connection?.remoteAddress);

module.exports = morgan(
    "Date -> :date[iso], IP -> :remote-addr, Protocol -> :protocol, User Agent -> :user-agent,  Referer -> :referer, Method -> :method, URL -> :url, Status -> :status, Content Length -> :res[content-length], - Response Time -> :response-time ms",
    {
        stream: logger.stream,
        skip: (req, res) => {
            return (
                req.originalUrl.startsWith("/api/system/resource") ||
                req.originalUrl.startsWith("/api/metrics") ||
                req.originalUrl.startsWith("/static")
            );
        },
    }
);
