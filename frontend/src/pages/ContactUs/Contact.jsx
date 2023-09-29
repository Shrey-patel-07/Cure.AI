import React from "react";
import "../ContactUs/Contact.css";

const Contact = () => {
  return (
    <div class="signup-page">
      <div class="left-section">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d918.2293014078999!2d72.48689812675615!3d22.99007184979838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9aee6c89a621%3A0x872df2d55fbb0008!2sLJ%20University!5e0!3m2!1sen!2sin!4v1695994782697!5m2!1sen!2sin"
          width="800"
          height="500"
          style={{ marginLeft: "3rem" }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <div class="right-section">
        <h1>Contact Us</h1>
        <form action="https://formspree.io/f/xvojvzvl" method="POST">
          <label className="label">
            Username
            <input
              type="text"
              name="username"
              class="form-input input"
              required
            />
          </label>
          <label className="label">
            Email
            <input
              type="email"
              name="email"
              class="form-input input"
              required
            />
          </label>
          <label className="label">
            <textarea
              className="text-area"
              name="message"
              id=""
              cols="74"
              rows="10"
              placeholder="Type your message here..."
            ></textarea>
          </label>
          <div class="form-footer">
            <button type="submit" class="action_btn">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
