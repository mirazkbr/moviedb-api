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
app.use(bodyParser.json());

// Define Movie schema
const movieSchema = new mongoose.Schema({
  name: String,
  year: { type: Number, default: 2022 }, // Set default year to 2022
  watched: Boolean,
  wishlist: Boolean,
  posterUrl: String,
});

const Movie = mongoose.model("movie", movieSchema);

// Route to add a new movie
app.post("/movies", async (req, res, next) => {
  let { name, year, posterUrl } = req.body;

  // Convert name to lowercase
  name = name.toLowerCase();

  // Set default year to 2022 if not provided
  year = year || 2022;

  if (!name) {
    return res.status(400).json({ message: "Name is required." });
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
app.put("/movies/:id/watched", async (req, res) => {
  const { id } = req.params; // Corrected parameter name

  try {
    const movie = await Movie.findByIdAndUpdate( // Using findByIdAndUpdate to update by _id
      id, // Using the _id received from the request parameters
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
app.put("/movies/:id/wishlist", async (req, res) => {
  const { id } = req.params; // Corrected parameter name

  try {
    const movie = await Movie.findByIdAndUpdate( // Using findByIdAndUpdate to update by _id
      id, // Using the _id received from the request parameters
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
