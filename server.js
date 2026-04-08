// require("dotenv").config();
// const express = require("express");
// const sequelize = require("./config/db");
// const cors = require("cors");

// const adminRoutes = require("./admin/adminRoute");
// const studentAuthRoutes = require("./student/studentAuthRoute");
// const studentAdmissionRoute = require("./studentAdmission/studentAdmissionRoute");
// const feeManagement = require("./fee_management/fee_tr_Routes");
// const bank_create = require("./bank_data/bank_routes");
// const feeMoneyExpenseTr = require("./adminExpense_into_Fee/expenseRoutes");  // for admin expense monay into student fee`s
// const student_attendance = require("./attendance_tracker/attendence_Router")

// const app = express();

// // CORS
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

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }))

// // Static folder for uploads
// app.use("/uploads", express.static("uploads"));

// // Routes
// app.use("/admin", adminRoutes);
// app.use("/student", studentAuthRoutes);
// app.use("/studentAdmission", studentAdmissionRoute);
// app.use("/feeManagement", feeManagement);
// app.use("/bank", bank_create);
// app.use("/fee_to_use_Expense", feeMoneyExpenseTr);
// app.use("/attendance", student_attendance)


// // Sync Sequelize
// sequelize.sync()
//   .then(() => console.log("Models Synced"))
//   .catch(err => console.log(err));

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

require("dotenv").config();
const express = require("express");
const sequelize = require("./config/db");
const cors = require("cors");

// Import Routes
const adminRoutes = require("./admin/adminRoute");
const studentAuthRoutes = require("./student/studentAuthRoute");
const studentAdmissionRoute = require("./studentAdmission/studentAdmissionRoute");
const feeManagement = require("./fee_management/fee_tr_Routes");
const bank_create = require("./bank_data/bank_routes");
const feeMoneyExpenseTr = require("./adminExpense_into_Fee/expenseRoutes");
const student_attendance = require("./attendance_tracker/attendence_Router");

// Import Models for Sync
require("./admin/adminModel"); 

const app = express();

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  "https://school-vert-beta.vercel.app",
  "https://school-backend-vps.loca.lt",
   "http://127.0.0.1:5500"
];

// 1. Pehle Origins ki list banayein
const allowedOrigins = [
    "https://school-vert-beta.vercel.app",
    "https://exploring-sustained-secretariat-smaller.trycloudflare.com", // Naya Cloudflare URL
    "http://localhost:3000",
    "http://127.0.0.1:5500"
];

// 2. CORS middleware ko sahi karein
app.use(cors({
    origin: function (origin, callback) {
        // Agar request local ho (!origin) ya hamari list mein ho
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin); // Debugging ke liye
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// --- ROUTES ---
app.use("/admin", adminRoutes);
app.use("/student", studentAuthRoutes);
app.use("/studentAdmission", studentAdmissionRoute);
app.use("/feeManagement", feeManagement);
app.use("/bank", bank_create);
app.use("/fee_to_use_Expense", feeMoneyExpenseTr);
app.use("/attendance", student_attendance);

// --- DB SYNC & SERVER START ---
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database Connection Established.");
    
    // Live server par alter: true dhyan se use karein
    await sequelize.sync({ alter: true });
    console.log("✅ Models Synced.");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

startServer();
