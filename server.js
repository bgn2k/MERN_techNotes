require('dotenv').config()//Need to intall the package to setup env specific settings
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const path = require("path"); //To Dynamically load files and access directories with ease.
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors"); //To handle cross origin resource sharing
const corsOptions = require("./config/corsOptions");
console.log('Current ENV: ',process.env.NODE_ENV)
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(logger);
app.use("/", express.static(path.join(__dirname, "/public"))); //All the routes paths will pass through this middleware function and all the path can directly use the public folder's assets.
app.use("/", require("./routes/root"));
app.use(express.json());
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (res.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});
app.use(errorHandler);
app.listen(PORT, () => console.log(`Server Running On ${PORT}`));
