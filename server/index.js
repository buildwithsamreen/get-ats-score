const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Connect Mongo ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    process.exit(1);
  });

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/resumes", require("./routes/resumes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
