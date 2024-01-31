const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./Models/UserModel");

const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// const DB = process.env.APP_MONGO_SERVER;
const DB = "mongodb+srv://shrey07patel:fnUadI7UizK1VXcz@cluster0.h2zcz0o.mongodb.net/users";
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("Error in connecting to server", error);
  });

// Routes
app.get("/", (req, res) => {
  res.json("Hello, world!");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database by username
    const user = await User.findOne({ username });

    if (!user) {
      // User not found
      return res.status(404).json({ error: "User not found" });
    }
    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Invalid password
      return res.status(401).json({ error: "Incorrect password" });
    }
    // Password is valid, user is authenticated
    // Send a success response
    res
      .status(200)
      .json({ message: "User logged in successfully", user: user._id });
  } catch (err) {
    // Handle any errors that occurred during the login process
    console.error("Error while logging in:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/signup", async (req, res) => {
  const { username, email, phoneNumber, gender, dob, password } = req.body;

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    const existingUserName = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (existingUserName) {
      return res.status(400).json({ error: "Username already exists" });
    }
    // Create a new user document
    const newUser = new User({
      username,
      email,
      phoneNumber,
      gender,
      dob,
      password,
    });

    // Save the new user to the database
    await newUser.save();

    // Send a success response
    res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    // Handle any errors that occurred during saving
    console.error("Error while saving user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the user in the database by ID
    const user = await User.findById(id);

    if (!user) {
      // User not found
      return res.status(404).json({ error: "User not found" });
    }

    // User found, return the user details
    res.status(200).json({ user });
  } catch (err) {
    // Handle any errors that occurred during the retrieval
    console.error("Error while retrieving user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const updatedData = req.body;

  try {
    // Find the user by ID and update the data
    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User data updated successfully", user });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// // CHAT WITH GPT

// const runPrompt = async (prompt) => {
//   const options = {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${fd.API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: "gpt-3.5-turbo-0613",
//       messages: [{ role: "assistant", content: prompt }],
//       max_tokens: 1024,
//     }),
//   };

//   try {
//     const response = await fetch(
//       "https://api.openai.com/v1/chat/completions",
//       options
//     );
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Some error occured*");
//   }
//   return;
// };


const runChatCompletion = async (prompt) => {
  const url = 'https://niansuh-hfllmapi.hf.space/api/v1/chat/completions';

  const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
  };

  const data = {
      model: 'mixtral-8x7b',
      messages: [
          {
              role: 'user',
              content: prompt,
          },
      ],
      temperature: 0,
      max_tokens: -1,
      stream: true,
  };

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data),
      });

      if (response.ok) {
          const responseText = await response.text();
          const outputData = responseText.split('\n').slice(0, -3);

          let outputString = '';

          for (const chunk of outputData) {
              try {
                  if (chunk.trim()) {
                      const jsonObj = JSON.parse(chunk.substring(5));
                      const content = jsonObj.choices[0]?.delta.content || '';
                      outputString += content;
                  }
              } catch (error) {
                  console.error('Error decoding JSON:', chunk, '-', error.message);
              }
          }

          return outputString;
      } else {
          console.error('Error:', await response.text());
          return '';
      }
  } catch (error) {
      console.error('Fetch error:', error.message);
      return '';
  }
};

// const runPrompt = async (prompt) => {
//   try {
//       const response = await runChatCompletion(prompt);
//       return response;
//   } catch (error) {
//       console.error('Some error occurred');
//       return '';
//   }
// };
// app.post("/general/chat", async (req, res) => {
//   const prompt = req.body.prompt;
//   try {
//     const response = await runPrompt(prompt);
//     res.send(response);
//   } catch (error) {
//     console.error("Some error occured");
//   }
// });
// Example usage:
app.post("/general/chat", async (req, res) => {
  const prompt = req.body.prompt;
  try {
      const response = await runChatCompletion(prompt);
      res.send(response);
  } catch (error) {
      console.error('Some error occurred');
      res.status(500).send('Internal Server Error');
  }
});

// Start the server
const port = 3001; // Choose any port you prefer
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
