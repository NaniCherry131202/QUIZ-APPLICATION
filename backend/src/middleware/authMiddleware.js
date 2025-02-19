const jwt = require("jsonwebtoken");

const ERROR_MESSAGES = {
    NO_TOKEN: "Unauthorized: No token provided",
    INVALID_TOKEN: "Invalid token",
    TOKEN_EXPIRED: "Token expired",
    INVALID_TOKEN_TYPE: "Invalid token type",
    MISSING_SECRET: "Internal server error",
};

const authMiddleware = async (req, res, next) => {
    console.log("⏳ authMiddleware is running...");

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ No token provided");
        return res.status(401).json({ error: ERROR_MESSAGES.NO_TOKEN });
    }

    const [tokenType, token] = authHeader.split(" ");
    if (tokenType !== "Bearer") {
        console.log("❌ Invalid token type");
        return res.status(401).json({ error: ERROR_MESSAGES.INVALID_TOKEN_TYPE });
    }

    if (!process.env.JWT_SECRET) {
        console.log("❌ JWT secret key is missing");
        return res.status(500).json({ error: ERROR_MESSAGES.MISSING_SECRET });
    }

    try {
        const verified = await jwt.verify(token, process.env.JWT_SECRET); // Verify and decode the token in one step
        console.log("✅ Token verified:", verified);
        const jwt = require("jsonwebtoken");

        const ERROR_MESSAGES = {
            NO_TOKEN: "Unauthorized: No token provided",
            INVALID_TOKEN: "Invalid token",
            TOKEN_EXPIRED: "Token expired",
            INVALID_TOKEN_TYPE: "Invalid token type",
            MISSING_SECRET: "Internal server error",
        };
        
        // Extracts and validates the Bearer token
        const extractToken = (authHeader) => {
            if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
            return authHeader.split(" ")[1]; // Extract token after "Bearer"
        };
        
        const authMiddleware = async (req, res, next) => {
            console.log("⏳ authMiddleware is running...");
        
            const token = extractToken(req.headers.authorization);
            if (!token) {
                console.log("❌ No valid token provided");
                return res.status(401).json({ error: ERROR_MESSAGES.NO_TOKEN });
            }
        
            if (!process.env.JWT_SECRET) {
                console.error("❌ JWT secret key is missing");
                return res.status(500).json({ error: ERROR_MESSAGES.MISSING_SECRET });
            }
        
            try {
                const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify token
                console.log("✅ Token verified:", verified);
        
                req.user = { id: verified.id, role: verified.role };
                next(); // Proceed to next middleware/route handler
            } catch (error) {
                console.error("❌ JWT Error:", error);
        
                if (error.name === "TokenExpiredError") {
                    return res.status(401).json({ error: ERROR_MESSAGES.TOKEN_EXPIRED });
                }
                return res.status(401).json({ error: ERROR_MESSAGES.INVALID_TOKEN });
            }
        };
        
        const adminMiddleware = (req, res, next) => {
            if (!req.user || req.user.role !== "admin") {
                return res.status(403).json({ error: "Access denied, admin only" });
            }
            next();
        };
        
        module.exports = { authMiddleware, adminMiddleware };
        
        // Attach necessary data to req.user
        req.user = { id: verified.id, role: verified.role }; // Use verified.id and verified.role
        console.log("req.user after verification:", req.user);
        next(); // Proceed to next middleware/route handler
    } catch (error) {
        console.log("❌ JWT Error:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: ERROR_MESSAGES.TOKEN_EXPIRED });
        }
        return res.status(401).json({ error: ERROR_MESSAGES.INVALID_TOKEN });
    }
};
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied, admin only" });
    }
    next();
  };


module.exports = {authMiddleware,adminMiddleware};

