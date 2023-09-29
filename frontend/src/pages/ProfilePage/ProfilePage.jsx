import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../ProfilePage/ProfilePage.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import profileImage from "../../assets/Images/profile.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faFloppyDisk,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { getUserDataRoute } from "../../Utils/APIRoutes";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [schedule, setSchedule] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const calculateAge = (dateString) => {
    const birthDate = new Date(dateString);
    const currentDate = new Date();

    const age = currentDate.getFullYear() - birthDate.getFullYear();

    if (
      currentDate.getMonth() < birthDate.getMonth() ||
      (currentDate.getMonth() === birthDate.getMonth() &&
        currentDate.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }

    return age;
  };

  useEffect(() => {
    const isDoc = localStorage.getItem("doctor_ai_isDoc");
    if (isDoc == "1") {
      navigate("/doctor/dashboard");
      return;
    }
    const userId = localStorage.getItem("doctor_ai_userID");

    if (userId) {
      fetchUserData(userId);
    } else {
      navigate("/login"); // Redirect to the login page if user is not logged in
    }
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(getUserDataRoute(userId));
      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
        console.log("User schedule");
        console.log(data.user.schedule);
        if (data.user.schedule.length != 0) {
          data.user.schedule.map((s) => fetchAppointmentDetails(s));
        } else setSchedule([]);
        toast.success("Successfully fetched user data.", {
          autoClose: 1500,
        });
      } else {
        toast.error("Error retrieving user data"); // Display toast error
        console.error("Error retrieving user data:", data.error);
      }
    } catch (error) {
      toast.error("Error retrieving user data"); // Display toast error
      console.error("Error retrieving user data:", error);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedData({
      username: userData.username,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      gender: userData.gender,
      dob: userData.dob,
    });
  };

  const handleSave = async () => {
    try {
      // Perform save operation or API call with editedData
      const response = await fetch(
        `http://localhost:3001/user/${userData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedData),
        }
      );

      if (response.ok) {
        // Update the userData state and exit edit mode
        setUserData(editedData);
        setIsEditMode(false);
        toast.success("Data saved successfully"); // Display toast success message
      } else {
        console.error("Error saving user data:", response.statusText);
      }
    } catch (error) {
      if (
        (error.response &&
          error.response.data &&
          error.response.data.error === "User not found") ||
        error.response.data.error === "Internal server error"
      ) {
        toast.error("Cannot update user Details!");
      } else {
        console.error("Error saving user data:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="profile-main">
      <aside className="profile-left-panel">
        <div className="pbtn active profile">
          <img src={profileImage} alt="profile" />
          <div className="name">
            <p>
              {isEditMode
                ? editedData?.username
                : userData?.username || "Your name"}
            </p>
          </div>
        </div>
        {/* <div className="pbtn">Schedules</div> */}
      </aside>
      <section className="profile-right-pannel">
        <div className="right-container">
          <div className="personal-info">
            <h2>
              My Details <FontAwesomeIcon icon={faCircleInfo} style={{}} />
            </h2>
            <p>Personal Information</p>
            <hr />
            <div className="personal-info-container">
              <div className="personal-info-text">
                <p>
                  Assertively utilize adaptive customer service for future-proof
                  platforms. Completely drive optimal markets.
                </p>
              </div>
              <div className="personal-field">
                <div className="personal-info-field">
                  <input
                    type="text"
                    className="username"
                    name="username"
                    placeholder="Username"
                    value={
                      isEditMode
                        ? editedData?.username
                        : userData?.username || ""
                    }
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                  <input
                    type="text"
                    className="phonenumber"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={
                      isEditMode
                        ? editedData?.phoneNumber
                        : userData?.phoneNumber || ""
                    }
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                  <input
                    type={isEditMode ? "date" : "text"}
                    className="dob"
                    name="dob"
                    placeholder="age"
                    value={
                      isEditMode
                        ? editedData?.dob
                        : calculateAge(userData?.dob) || ""
                    }
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                  <input
                    type="text"
                    className="gender"
                    name="gender"
                    placeholder="Gender"
                    value={
                      isEditMode ? editedData?.gender : userData?.gender || ""
                    }
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                  <input
                    type="email"
                    className="email"
                    name="email"
                    placeholder="Email"
                    value={
                      isEditMode ? editedData?.email : userData?.email || ""
                    }
                    onChange={handleChange}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="save_edit_container">
                  {isEditMode ? (
                    <button onClick={handleSave} className="save_edit">
                      <FontAwesomeIcon icon={faFloppyDisk} /> Save
                    </button>
                  ) : (
                    <button onClick={handleEdit} className="save_edit">
                      <FontAwesomeIcon icon={faPenToSquare} /> Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
