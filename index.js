const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://miraz:miraz@cluster0.ppw9ica.mongodb.net/moviedb?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});
app.use(cors());

// Define Movie schema
const movieSchema = new mongoose.Schema({
  name: String,
  year: Number,
  watched: Boolean,
  wishlist: Boolean,
  posterUrl: String, // Added posterUrl field
});

const Movie = mongoose.model("movie", movieSchema);

app.use(bodyParser.json());

// Route to add a new movie
app.post("/movies", async (req, res, next) => {
  const { name, year, posterUrl } = req.body;

  if (!name || !year) {
    return res.status(400).json({ message: "Name and year are required." });
  }

  try {
    const movie = new Movie({
      name,
      year,
      watched: false,
      wishlist: false,
      posterUrl,
    });

    await movie.save();

    res.status(201).json({ message: "Movie added successfully.", movie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Route to get all movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Route to mark a movie as watched
app.put("/movies/:name/watched", async (req, res) => {
  const { name } = req.params;

  try {
    const movie = await Movie.findOneAndUpdate(
      { name },
      { watched: true, wishlist: false },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    res.json({ message: "Movie marked as watched.", movie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Route to add a movie to the wishlist
app.put("/movies/:name/wishlist", async (req, res) => {
  const { name } = req.params;

  try {
    const movie = await Movie.findOneAndUpdate(
      { name },
      { wishlist: true },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    res.json({ message: "Movie added to wishlist.", movie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
