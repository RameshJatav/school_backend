// controllers/studentAuthController.js
const bcrypt = require("bcrypt");
const StudentAuth = require("./studentAuthModel");
const StudentOTP = require("./studentOtpModel");
const transporter = require("../config/mail");
const StudentAdmission = require("../studentAdmission/studentAdmissionModel");

// ================= REGISTER STUDENT (ADMIN ONLY) =================
exports.registerRequest = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    // ✅ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const exists = await StudentAuth.findOne({ where: { email } });
    if (exists)
      return res.status(409).json({ message: "Student already exists" });

    const hash = await bcrypt.hash(password, 10);

    await StudentAuth.create({
      email,
      password: hash,
      createdBy: adminId,
    });

    res.json({ message: "Student registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
};

// ================= LOGIN (EMAIL + PASSWORD) =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await StudentAuth.findOne({ where: { email } });
    if (!student)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await StudentOTP.destroy({ where: { email } });

    await StudentOTP.create({
      email,
      otp,
      expires_at: expiresAt,
    });

    await transporter.sendMail({
      to: email,
      subject: "Login OTP - JAMIA TARBIA TUL BANAT SOCIATY JAJOR",
      html: `
    <div style="font-family: Arial, sans-serif;">
      <h2>JAMIA TARBIA TUL BANAT SOCIATY JAJOR</h2>
      <p>Your Login OTP is:</p>
      <h1 style="color: #2e6c80;">${otp}</h1>
      <p>Valid for 10 minutes</p>
      <br/>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `,
    });

    console.log("🔐 LOGIN OTP:", otp);
    res.json({ message: "OTP Sent successfully. Please Check Your Mailbox." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Email aur OTP ko clean karein (Extra spaces hatayein)
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const record = await StudentOTP.findOne({ where: { email: cleanEmail } });

    if (!record) {
      return res
        .status(401)
        .json({ message: "No OTP request found for this email" });
    }

    // Expiry Check
    if (new Date() > record.expires_at) {
      await StudentOTP.destroy({ where: { email: cleanEmail } });
      return res.status(401).json({ message: "OTP expired" });
    }

    // Strict Comparison
    if (record.otp !== cleanOtp) {
      return res.status(401).json({ message: "Invalid OTP code" });
    }

    // Success -> Delete OTP
    await StudentOTP.destroy({ where: { email: cleanEmail } });

    const admission = await StudentAdmission.findOne({
      where: { email: cleanEmail },
    });

    return res.json({
      success: true,
      message: "Login successful",
      admission: admission || null,
    });
  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= RESEND OTP =================
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const student = await StudentAuth.findOne({ where: { email } });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await StudentOTP.destroy({ where: { email } });

    await StudentOTP.create({
      email,
      otp,
      expires_at: expiresAt,
    });

    await transporter.sendMail({
      to: email,
      subject: "Resend OTP - JAMIA TARBIA TUL BANAT SOCIATY JAJOR",
      html: `
    <div style="font-family: Arial, sans-serif;">
      <h2>JAMIA TARBIA TUL BANAT SOCIATY JAJOR</h2>
      <p>Your Resent OTP is:</p>
      <h1 style="color: #2e6c80;">${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
      <br/>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `,
    });

    console.log("🔐 Resent OTP:", otp);

    res.json({
      message: "OTP resent successfully. Please Check Your Mailbox.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
