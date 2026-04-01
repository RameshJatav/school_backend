const Bank = require("./bank_model");

exports.createBank = async (req, res) => {
  try {
    const bank = await Bank.create(req.body);
    res.status(201).json(bank);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBank = async (req, res) => {
  try {
    const bank = await Bank.findAll();
    res.json(bank);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
