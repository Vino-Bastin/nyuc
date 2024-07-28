const dotenv = require("dotenv");
dotenv.config({
    path: ".env",
});

const path = require("path");
const express = require("express");
require("express-async-errors");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const logger = require("./util/logger");
const morgan = require("./util/morgan");
const minifier = require("./util/minifier");
const connectDB = require("./db/connection");

connectDB();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(expressLayouts);
app.set("view engine", "ejs");

app.use(morgan);
app.disable("x-powered-by");
app.set("etag", false);

app.use(minifier);

app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/users", require("./routes/user"));
app.use("/admin", require("./routes/admin"));
app.use("/", (_, res) => res.redirect("/users/register"));

app.listen(process.env.PORT || 5000, () =>
    logger.info(`Server running on port ${process.env.PORT}`)
);
