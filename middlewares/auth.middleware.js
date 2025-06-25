const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vraimentsecret');
    req.user = decoded; // On stocke les infos du token dans la requête
    next(); // On continue
  } catch (err) {
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};