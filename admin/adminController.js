const Admin = require("./adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASS_KEY = "admin12#school%Ramesh";

// Password strength checker
const isStrongPassword = (password) => {
  const strongRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
  return strongRegex.test(password);
};

const LOWERCASE_EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

exports.register = async (req, res) => {
  try {
    const { name, email, password, pass_key } = req.body;

    if (pass_key !== ADMIN_PASS_KEY) {
      return res.status(403).json({ message: "Invalid admin pass key" });
    }

    // ❌ CAPITAL LETTER CHECK
    if (!LOWERCASE_EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Email must be lowercase only"
      });
    }

    const existingAdmin = await Admin.findOne({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin already registered"
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      email,
      password: hashPassword
    });

    res.json({ message: "Admin registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({
      where: Sequelize.where(
        Sequelize.fn("BINARY", Sequelize.col("email")),
        email
      )
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    await Admin.update(
      { token, lastActivity: new Date() },
      { where: { id: admin.id } }
    );

    res.json({
      message: "Login successful",
      token,
      admin:{
        id: admin.id,
        name: admin.name,
        email: admin.email
      }

    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAdmin = async (req, res) => {
  try {
    const { id } = req.params; 
    
    if (!id) {
      return res.status(400).json({
        message: "Admin id is required"
      });
    }

    const admin = await Admin.findOne({
      where: { id },
      attributes: ["id", "name", "email", "lastActivity"] // 🔒 password hide
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    return res.status(200).json({
      message: "Admin data fetched successfully",
      admin
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};
