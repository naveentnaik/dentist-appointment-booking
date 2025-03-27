import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import axios from "axios";
import api from "./api/api";

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [reportType, setReportType] = useState("monthly");
  const [appointmentData, setAppointmentData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [selectedPatientList, setSelectedPatientList] = useState([]);

  const getData = async () => {
    try {
      const response = await api.get("/get-all-bookings");
      console.log("Fetched Data:", response.data);

      // Map data to match table columns
      const formattedData = response.data.bookings.map((appointment) => ({
        date: new Date(appointment.bookingDate).toLocaleDateString(),
        patientName: appointment.customer?.name || "Unknown",
        dentistName: appointment.dentist?.user?.name || "Unknown",
        serviceRequested: appointment.service?.name || "Unknown",
      }));

      setAppointmentData(formattedData);
    } catch (error) {
      console.error(
        "Error fetching bookings:",
        error.response?.data || error.message
      );
    }
  };

  const getReport = async () => {
    try {
      const { data } = await api.get(`/report/${reportType}`);
      console.log(data);

      // Format the report data for the table
      const formattedReportData = data.report.map((dentistReport) => ({
        dentistName: dentistReport.dentistName,
        bookings: dentistReport.noOfBookings,
        date: reportType === "monthly" ? "Current Month" : "Current Week",
        patientList: dentistReport.patientList.map((patient) => ({
          name: patient.patientName,
          service: patient.serviceRequested,
          date: new Date(patient.bookingDate).toLocaleDateString(),
        })),
      }));

      setReportData(formattedReportData);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const navigate = useNavigate();

  const handleViewPatients = (patientList) => {
    setSelectedPatientList(patientList);
    setModalOpen(true);
  };

  useEffect(() => {
    getReport();
  }, [reportType]);

  useEffect(() => {
    getData();
  }, []);
  // Form states
  const [serviceForm, setServiceForm] = useState({ name: "", price: "" });
  const [dentistForm, setDentistForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: "",
    gender: "",
    hourlyRate: "",
  });
  

  const handleServiceFormChange = (e) => {
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });
  };

  const handleDentistFormChange = (e) => {
    const value = e.target.type === "radio" ? e.target.id : e.target.value;
    setDentistForm({ ...dentistForm, [e.target.name]: value });
  };  

  const handleSubmitService = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const serviceData = {
        name: serviceForm.name,
        price: parseFloat(serviceForm.price),
      };

      const response = await axios.post(
        "http://localhost:5000/api/service",
        serviceData,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      console.log("Service added:", response.data);
      setServiceForm({ name: "", price: "" });
      alert("Service added successfully");
      setActiveView("dashboard");
    } catch (error) {
      console.error(
        "Error adding service:",
        error.response?.data || error.message
      );
      alert(
        "Error adding service: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleSubmitDentist = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("token");
  
      // This must exactly match the destructuring in your API endpoint
      const dentistData = {
        name: dentistForm.name,
        email: dentistForm.email,
        password: dentistForm.password,
        mobileNo: dentistForm.mobileNo,
        gender: dentistForm.gender,
        hourlyRate: parseFloat(dentistForm.hourlyRate), // Convert to number if needed
      };
  
      console.log("Sending dentist data:", dentistData);
  
      const response = await axios.post(
        "http://localhost:5000/api/add-dentist",
        dentistData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Dentist added:", response.data);
  
      // Reset form with the correct field names
      setDentistForm({
        name: "",
        email: "",
        password: "",
        mobileNo: "",
        gender: "",
        hourlyRate: "",
      });
  
      alert("Dentist added successfully");
      setActiveView("dashboard");
    } catch (error) {
      console.error("Error adding dentist:", error.response?.data || error.message);
      alert("Error adding dentist: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="logo">LOGO</div>
        <ul className="nav-menu">
          <li
            className={activeView === "dashboard" ? "active" : ""}
            onClick={() => setActiveView("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={activeView === "addServices" ? "active" : ""}
            onClick={() => setActiveView("addServices")}
          >
            Add Services
          </li>
          <li
            className={activeView === "viewReport" ? "active" : ""}
            onClick={() => setActiveView("viewReport")}
          >
            View Report
          </li>
          <li
            className={activeView === "addDentist" ? "active" : ""}
            onClick={() => setActiveView("addDentist")}
          >
            Add Dentist
          </li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>
            {activeView === "dashboard"
              ? "Dashboard"
              : activeView === "addServices"
              ? "Add Services"
              : activeView === "viewReport"
              ? "View Report"
              : "Add Dentist"}
          </h1>
          <div className="admin-profile">
            <span>Admin</span>
            <div className="profile-circle"></div>
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {activeView === "dashboard" && (
          <div className="dashboard-content">
            <div className="appointments-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Appointment Date</th>
                    <th>Patient Name</th>
                    <th>Dentist Name</th>
                    <th>Service Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentData.map((appointment, index) => (
                    <tr key={index}>
                      <td>{appointment.date}</td>
                      <td>{appointment.patientName}</td>
                      <td>{appointment.dentistName}</td>
                      <td>{appointment.serviceRequested}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeView === "addServices" && (
          <div className="form-content">
            <form onSubmit={handleSubmitService}>
              <div className="form-group">
                <label>Service name</label>
                <input
                  type="text"
                  name="name"
                  value={serviceForm.name}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price of the service</label>
                <input
                  type="number"
                  name="price"
                  value={serviceForm.price}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>
              <div className="form-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setActiveView("dashboard")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Service
                </button>
              </div>
            </form>
          </div>
        )}

        {activeView === "viewReport" && (
          <div className="report-content">
            <div className="report-toggle">
              <button
                className={reportType === "weekly" ? "active" : ""}
                onClick={() => setReportType("weekly")}
              >
                Weekly
              </button>
              <button
                className={reportType === "monthly" ? "active" : ""}
                onClick={() => setReportType("monthly")}
              >
                Monthly
              </button>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Dentist Name</th>
                  <th>No. Of Bookings</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((report, index) => (
                  <tr key={index}>
                    <td>{report.date}</td>
                    <td>{report.dentistName}</td>
                    <td>{report.bookings}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewPatients(report.patientList)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeView === "addDentist" && (
          <div className="form-content">
            <form onSubmit={handleSubmitDentist}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={dentistForm.name}
                    onChange={handleDentistFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={dentistForm.email}
                    onChange={handleDentistFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile No.</label>
                  <input
                    type="tel"
                    name="mobileNo"
                    value={dentistForm.mobileNo}
                    onChange={handleDentistFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <div className="radio-group">
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="Male"
                        name="gender"
                        checked={dentistForm.gender === "Male"}
                        onChange={handleDentistFormChange}
                      />
                      <label htmlFor="Male">Male</label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="female"
                        name="gender"
                        checked={dentistForm.gender === "female"}
                        onChange={handleDentistFormChange}
                      />
                      <label htmlFor="female">Female</label>
                    </div>
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="other"
                        name="gender"
                        checked={dentistForm.gender === "other"}
                        onChange={handleDentistFormChange}
                      />
                      <label htmlFor="other">Other</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hourly Rate</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={dentistForm.hourlyRate}
                    onChange={handleDentistFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={dentistForm.username}
                    onChange={handleDentistFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={dentistForm.password}
                  onChange={handleDentistFormChange}
                  required
                />
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setActiveView("dashboard")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Dentist
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Patient List</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <table className="patient-list-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Service Requested</th>
                    <th>Booking Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPatientList.map((patient, index) => (
                    <tr key={index}>
                      <td>{patient.name}</td>
                      <td>{patient.service}</td>
                      <td>{patient.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
