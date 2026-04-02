require("dotenv").config();
const express = require("express");
const sequelize = require("./config/db");
const cors = require("cors");

const adminRoutes = require("./admin/adminRoute");
const studentAuthRoutes = require("./student/studentAuthRoute");
const studentAdmissionRoute = require("./studentAdmission/studentAdmissionRoute");
const feeManagement = require("./fee_management/fee_tr_Routes");
const bank_create = require("./bank_data/bank_routes");
const feeMoneyExpenseTr = require("./adminExpense_into_Fee/expenseRoutes");  // for admin expense monay into student fee`s
const student_attendance = require("./attendance_tracker/attendence_Router")

const app = express();

// CORS
// app.use(cors({
//     // origin: "https://school-vert-beta.vercel.app", // Aapka Vercel URL
//     origin: ["https://school-vert-beta.vercel.app", "http://127.0.0.1:5500", "https://jgqw00mq-5500.inc1.devtunnels.ms/index.html", "null"],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Bypass-Tunnel-Reminder']
// }));

// // ⚡ Sabse Important Middleware (Dev Tunnel Bypass)
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "https://school-vert-beta.vercel.app", "https://jgqw00mq-5500.inc1.devtunnels.ms/index.html" );
//     res.header("Access-Control-Allow-Credentials", "true");
//     res.header("Bypass-Tunnel-Reminder", "true"); 
//     res.header("X-Requested-With", "XMLHttpRequest");

//     // Preflight (OPTIONS) request ko handle karein
//     if (req.method === "OPTIONS") {
//         return res.status(200).send("OK");
//     }
//     next();
// });
const allowedOrigins = [
  "https://school-vert-beta.vercel.app",
  "http://127.0.0.1:5500",
  "https://jgqw00mq-5500.inc1.devtunnels.ms"
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error('CORS not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// FIXED HEADERS
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Static folder for uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/admin", adminRoutes);
app.use("/student", studentAuthRoutes);
app.use("/studentAdmission", studentAdmissionRoute);
app.use("/feeManagement", feeManagement);
app.use("/bank", bank_create);
app.use("/fee_to_use_Expense", feeMoneyExpenseTr);
app.use("/attendance", student_attendance)


// Sync Sequelize
sequelize.sync()
  .then(() => console.log("Models Synced"))
  .catch(err => console.log(err));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

