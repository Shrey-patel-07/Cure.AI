const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./Models/UserModel");
const Doctor = require("./Models/DoctorModel");
const Appointment = require("./Models/AppointmentModel");

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

app.delete("/appointment/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { doctorId, userId } = req.body;

    // delete from doctor
    const docDetail = await Doctor.findById(doctorId);
    if (!docDetail) {
      return res
        .status(404)
        .json({ message: "Doctor not found", success: false });
    }

    const DocoldSchedule = docDetail.schedule;
    const DocnewSchedule = DocoldSchedule.filter((s) => s !== id);
    docDetail.schedule = DocnewSchedule;

    // delete from user
    const userDetail = await User.findById(userId);
    if (!userDetail) {
      return res
        .status(404)
        .json({ message: "Client not found", success: false });
    }

    const userSchedule = docDetail.schedule;
    const newUserSchedule = userSchedule.filter((s) => s !== id);
    userDetail.schedule = newUserSchedule;

    await docDetail.save();
    await userDetail.save();

    const response = await Appointment.findByIdAndDelete(id);
    if (!response) {
      return res
        .status(404)
        .json({ message: "Appointment not found", success: false });
    }
    res
      .status(200)
      .json({ message: "Appointment deleted successfully", success: true });
  } catch (error) {
    return res.status(502).json({ message: "Server Error", success: false });
  }
});

const generateMeetingCode = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let code = "";

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      code += randomChar;
    }

    if (i < 2) {
      code += "-";
    }
  }

  return code;
};

app.post("/appointment", async (req, res) => {
  const { doctorId, clientId, timeOfAppointment, dateOfAppointment, about } =
    req.body;

  try {
    // Create a new user document
    const newAppointment = new Appointment({
      doctorId,
      clientId,
      meetingId: generateMeetingCode(),
      timeOfAppointment,
      dateOfAppointment,
      about,
    });

    // Save the new user to the database
    const result = await newAppointment.save();
    const appointmentId = result._id;
    const user = await User.findById(clientId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.schedule.push(appointmentId);
    await user.save();

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    doctor.schedule.push(appointmentId);
    await doctor.save();
    // Send a success response
    res.status(200).json({ message: "Appointment created successfully" });
  } catch (err) {
    // Handle any errors that occurred during saving
    console.error("Error while saving appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/appointment/:id", async (req, res) => {
  const appointmentId = req.params.id;

  try {
    // Find the appointment in the database by ID
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      // Appointment not found
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Appointment found, return the appointment details
    res.status(200).json({ appointment });
  } catch (err) {
    // Handle any errors that occurred during the retrieval
    console.error("Error while retrieving appointment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/doctor/signup", async (req, res) => {
  const {
    username,
    email,
    phoneNumber,
    gender,
    dob,
    password,
    specialization,
  } = req.body;

  try {
    const existingUser = await Doctor.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newDoctor = new Doctor({
      username,
      email,
      phoneNumber,
      gender,
      dob,
      password,
      specialization,
    });

    await newDoctor.save();

    res.status(200).json({ message: "Doctor created successfully" });
  } catch (err) {
    console.error("Error while saving doctor:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/doctor/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const doct = await Doctor.findOne({ username });
    if (!doct) {
      return res
        .status(404)
        .json({ message: "Doctor not found", success: false });
    }
    const isPasswordValid = await bcrypt.compare(password, doct.password);

    if (!isPasswordValid) {
      // Invalid password
      return res
        .status(401)
        .json({ message: "Incorrect password", success: false });
    }
    res.status(200).json({
      message: "Doctor logged in successfully!",
      success: true,
      user: doct._id,
    });
  } catch (error) {}
});

app.get("/doctor/details", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/doctor/details/:id", async (req, res) => {
  const doctorId = req.params.id;
  try {
    // Find the appointment in the database by ID
    const response = await Doctor.findById(doctorId);

    if (!response) {
      // Appointment not found
      return res.status(404).json({ error: "Doctor details not found" });
    }

    // Appointment found, return the appointment details
    res.status(200).json(response);
  } catch (err) {
    // Handle any errors that occurred during the retrieval
    console.error("Error while retrieving doctor:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


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
