import React from 'react';
import { useEffect } from 'react';

export default function AboutUs() {
  useEffect(() => {
    // Function to animate the numbers
    function animateValue(obj, start, end, duration) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.textContent = Math.floor(progress * (end - start) + start) + "+";
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }

    // Animate the stats
    const stats = document.querySelectorAll(".stat-card h3");
    stats.forEach((stat) => {
      const target = parseInt(stat.textContent.replace(/[^0-9]/g, ''), 10); 
      animateValue(stat, 0, target, 1000); 
    });
  }, []);

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <div className="about-hero">
        <h1>About <span className="oneL">DriveBidRent</span></h1>
        <p>Your Trusted Partner in Automotive Solutions</p>
      </div>

      {/* Our Story Section */}
      <section className="our-story">
        <h2>Our Story</h2>
        <div className="story-content">
          <div className="story-text">
            <p>Founded in 2025, DriveBidRent emerged from a simple vision: to revolutionize the way people buy, sell, and rent vehicles. We understood the challenges faced by both buyers and sellers in the traditional automotive market and set out to create a platform that would make the process seamless, transparent, and enjoyable.</p>
            <p>What started as a small startup has now grown into a trusted platform serving thousands of satisfied customers across the country.</p>
          </div>
          <div className="stats-container">
            <div className="stat-card">
              <h3>5000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-card">
              <h3>1000+</h3>
              <p>Successful Auctions</p>
            </div>
            <div className="stat-card">
              <h3>500+</h3>
              <p>Rental cars</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="our-mission">
        <h2>Our Mission</h2>
        <div className="mission-cards">
          <div className="mission-card">
            <h3>Trust & Transparency</h3>
            <p>We believe in complete transparency in every transaction, ensuring both buyers and sellers have access to accurate information and fair pricing.</p>
          </div>
          <div className="mission-card">
            <h3>Quality Service</h3>
            <p>Our commitment to quality extends beyond just vehicles. We ensure every aspect of our service meets the highest standards of excellence.</p>
          </div>
          <div className="mission-card">
            <h3>Customer First</h3>
            <p>Your satisfaction is our priority. We're dedicated to providing personalized solutions that meet your specific needs and preferences.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="our-team">
        <h2>Meet Our Team</h2>
        <div className="team-container">
          <div className="team-card">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="CEO" />
            <h3>M V Tejesh</h3>
            <p className="position">Captain</p>
            <p className="bio">The captain of this project and makes driver dashboard and ensures smooth operational functions.</p>
          </div>
          <div className="team-card">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="COO" />
            <h3>V Jeevan Guptha</h3>
            <p className="position">Front-end designer</p>
            <p className="bio">Jeevan designed the buyer dashboard page and UI/UX designer of this project.</p>
          </div>
          <div className="team-card">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="CTO" />
            <h3>Sk Toufeeq</h3>
            <p className="position">Chief Technology Officer</p>
            <p className="bio">Toufeeq leads our technical innovations and platform development initiatives.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2>Get in Touch</h2>
        <div className="contact-container">
          <div className="contact-info">
            <div className="contact-card">
              <h3>Visit Us</h3>
              <p>SB-2, Sagar Colony</p>
              <p>Hyderabad, India</p>
            </div>
            <div className="contact-card">
              <h3>Contact Us</h3>
              <p>Email: <a href="mailto:jeevanvankadara@gmail.com">jeevanvankadara@gmail.com</a></p>
              <p>Phone: <a href="tel:9876543210">+91 9876543210</a></p>
            </div>
            <div className="contact-card">
              <h3>Business Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}