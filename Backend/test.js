const mongoose = require("mongoose");

// Replace 'mongodb://localhost/test' with your MongoDB connection URI and database name
const mongoURI = "mongodb://localhost/test";

// Define a random schema
const randomSchema = new mongoose.Schema({
  field1: String,
  field2: Number,
});

// Define a model based on the schema
const RandomModel = mongoose.model("RandomModel", randomSchema);

async function testMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Create a sample document
    const doc = new RandomModel({
      field1: "Value 1",
      field2: 42,
    });

    // Save the document
    await doc.save();

    console.log("Document saved");

    // Query and display the document
    const result = await RandomModel.find({});

    console.log("RandomModel documents:");
    console.log(result);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the test function
testMongoDB();
