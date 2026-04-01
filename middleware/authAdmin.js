const jwt = require("jsonwebtoken");
const Admin = require("../admin/adminModel");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const admin = await Admin.findOne({
      where: { id: decoded.id, token }
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const now = new Date();
    const last = new Date(admin.lastActivity);
    const diff = (now - last) / 1000 / 60;

    if (diff > 10) {
      await Admin.update({ token: null }, { where: { id: admin.id } });
      return res.status(401).json({
        message: "Session expired due to inactivity"
      });
    }

    admin.lastActivity = now;
    await admin.save();

    req.admin = admin;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
