const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  User,
  Booking,
  Service,
  Report,
  BookingRestriction,
  Dentist,
} = require("../models");
const { authenticateUser } = require("../middleware/auth.middleware");
const router = express.Router();

JWT_SECRET = process.env.JWT_SECRET;

// User Registration (Customer Only)
router.post("/register", async (req, res) => {
  const { name, email, password, role = "customer" } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user", error });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res. status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, role: user.role, user_id: user._id });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

// Create a new booking (Customer)
router.post("/book", async (req, res) => {
  const { customerId, serviceId, dentistId, bookingDate, timeSlot } = req.body;
  try {
    const booking = new Booking({
      customer: customerId,
      service: serviceId,
      dentist: dentistId,
      timeSlot: timeSlot,
      bookingDate: bookingDate,
      paymentStatus: "completed",
    });
    await booking.save();
    res.status(201).json({ message: "Booking created, pending payment" });
  } catch (error) {
    res.status(500).json({ error: "Error creating booking" });
  }
});

// Mark booking as completed (Dentist)
router.put("/booking/:id/complete", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ message: "Booking marked as completed", booking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Add a new service (Admin)
router.post("/service", authenticateUser, async (req, res) => {
  const { name, price } = req.body;
  try {
    const service = new Service({ name, price });
    await service.save();
    res.status(201).json({ message: "Service added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding service" });
  }
});

router.get("/get-all-dentists-services", authenticateUser, async (req, res) => {
  try {
    const dentists=await Dentist.find().populate("userId", "name email")
    const services=await Service.find()
    console.log(dentists,services)
    res.status(201).json({ data:{
      dentists,
      services
    } });
  } catch (error) {
    res.status(500).json({ error: "Error Fetching service" });
  }
});

router.get("/get-bookings-dentists/:id", authenticateUser, async (req, res) => {
  try {
    
    const bookings = await Booking.find({ dentist: req.params.id }).populate("service customer");

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this dentist" });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Server Error:", error); 
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

router.get("/get-all-bookings", authenticateUser, async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "services", // Service collection
          localField: "service",
          foreignField: "_id",
          as: "service"
        }
      },
      {
        $unwind: { path: "$service", preserveNullAndEmptyArrays: true } // Convert array to object
      },
      {
        $lookup: {
          from: "users", // User collection (customers)
          localField: "customer",
          foreignField: "_id",
          as: "customer"
        }
      },
      {
        $unwind: { path: "$customer", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "dentists", // Dentist collection
          localField: "dentist",
          foreignField: "userId",
          as: "dentist"
        }
      },
      {
        $unwind: { path: "$dentist", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "users", // User collection (to get dentist details)
          localField: "dentist.userId",
          foreignField: "_id",
          as: "dentist.user"
        }
      },
      {
        $unwind: { path: "$dentist.user", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          bookingDate: 1,
          timeSlot: 1,
          paymentStatus: 1,
          status: 1,
          "service._id": 1,
          "service.name": 1,
          "customer._id": 1,
          "customer.name": 1,
          "customer.email": 1,
          "dentist._id": 1,
          "dentist.hourlyRate": 1,
          "dentist.user.name": 1,
          "dentist.user.email": 1
        }
      }
    ]);

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});


router.get("/get-bookings-patient/:id", authenticateUser, async (req, res) => {
  try {
  
    const bookings=await Booking.aggregate([
      {
        $match:{
          customer:new mongoose.Types.ObjectId(req.params.id)
        },
      },
      {
        $lookup:{
          from:"dentists",
          localField: "dentist",
          foreignField:"userId",
          as:"dentist"
        }
      },
      {
        $lookup:{
          from:"services",
          localField:"service",
          foreignField:"_id",
          as:"service"
        }

      }
       
    ])

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this dentist" });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Server Error:", error); 
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

router.post("/add-dentist", authenticateUser, async (req, res) => {
  try {
    const { name, email, password, mobileNo, gender, hourlyRate } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Dentist already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "dentist",
    });

    const savedUser = await newUser.save();
    if (!savedUser || !savedUser._id) {
      return res.status(500).json({ message: "Failed to create user" });
    }
    

    const newDentist = new Dentist({
      userId: savedUser._id,
      mobileNo,
      gender,
      hourlyRate,
    });
    await newDentist.save();

    return res.status(201).json({ message: "Dentist added successfully", user: savedUser });


  } catch (error) {

    res.status(500).json({message:"Server error while adding Dentist",error})

  }
});

// Fetch weekly/monthly reports (Admin)
router.get("/report/:period", async (req, res) => {
  try {
    // Calculate Date Range
    const today = new Date();
    let startDate, endDate;

    if (req.params.period === "weekly") {
      startDate = new Date(today.setDate(today.getDate() - 7));
    } else if (req.params.period === "monthly") {
      startDate = new Date(today.setMonth(today.getMonth() - 1));
    } else {
      return res.status(400).json({ error: "Invalid period. Use 'weekly' or 'monthly'." });
    }

    endDate = new Date(); // Today's date

    // Fetch bookings within the date range
    const bookings = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customer"
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service"
        }
      },
      {
        $lookup: {
          from: "dentists",
          localField: "dentist",
          foreignField: "userId",
          as: "dentist"
        }
      },
      {
        $unwind: { path: "$customer", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$service", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$dentist", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "users",
          localField: "dentist.userId",
          foreignField: "_id",
          as: "dentistUser"
        }
      },
      {
        $unwind: { path: "$dentistUser", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          bookingDate: 1,
          timeSlot: 1,
          paymentStatus: 1,
          status: 1,
          "customerName": "$customer.name",
          "serviceName": "$service.name",
          "dentistName": "$dentistUser.name"
        }
      }
    ]);


    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found for the selected period." });
    }

    // Group data by Dentist
    const report = {};
    bookings.forEach((booking) => {
      const dentistId = booking.dentistName || "Unknown";
      const dentistName = booking.dentistName || "Unknown";

      if (!report[dentistId]) {
        report[dentistId] = {
          dentistName,
          noOfBookings: 0,
          patientList: [],
        };
      }

      report[dentistId].noOfBookings++;
      report[dentistId].patientList.push({
        patientName: booking.customerName || "Unknown",
        serviceRequested: booking.serviceName || "Unknown Service",
        bookingDate: booking.bookingDate, // Format YYYY-MM-DD
      });
    });

    // Convert report object to array
    const finalReport = Object.values(report);

    return res.status(200).json({
      period: req.params.period,
      report: finalReport,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





module.exports = router;
