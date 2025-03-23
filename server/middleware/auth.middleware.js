const jwt =require("jsonwebtoken");

 const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization");
    
    if (!token) return res.status(401).json({ error: "Access Denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach user details to request
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid Token" ,error});
    }
};

 const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied, admin only' });
    }
    next();
};


module.exports={authenticateUser,authorizeAdmin}