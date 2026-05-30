require("dotenv").config();
const express = require("express");
const cors = require("cors");

const adminRoutes = require("./routes/adminRoutes");
const publicRoutes = require("./routes/publicRoutes");

if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET environment variable is not set");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
