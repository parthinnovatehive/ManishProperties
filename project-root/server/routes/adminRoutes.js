const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const { loginSchema } = require("../validators/authValidators");
const { createAndSendOTP, verifyOTP } = require("../lib/otpService");
const {
  MODERATION_STATUSES,
  propertyCreateData,
  validatePropertyPayload,
} = require("../lib/propertyPayload");

const router = express.Router();

function propertyNotFound(res) {
  return res.status(404).json({
    success: false,
    message: "Property not found",
  });
}

function handleRouteError(res, error) {
  console.log(error);

  if (error && error.code === "P2025") {
    return propertyNotFound(res);
  }

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
}

// RATE LIMITER FOR LOGIN ROUTE
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// LOGIN ROUTE
router.post("/login", loginLimiter, async (req, res) => {

  try {

    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || "Invalid login request",
      });
    }

    const { username, password, role } = req.body;

    const admin = await prisma.admin.findUnique({
      where: {
        username,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Role verification if a role was explicitly requested
    if (role) {
      const dbRole = admin.role.toUpperCase();
      const reqRole = role.toUpperCase();
      const isMatch = (reqRole === 'ADMIN' && (dbRole === 'ADMIN' || dbRole === 'SUPER_ADMIN')) ||
                      (reqRole === dbRole);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: `Your account role does not match the selected role: ${role}`,
        });
      }
    }

    const token = jwt.sign(
      {
        adminId: admin.id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        name: admin.name,
        phone: admin.phone,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

});


// SEND OTP ROUTE
router.post("/otp/send", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const result = await createAndSendOTP(phone);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.json({
      success: true,
      message: result.message,
      simulated: result.simulated,
    });
  } catch (error) {
    console.error("Error in /otp/send:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

// VERIFY OTP ROUTE
router.post("/otp/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP code are required",
      });
    }

    const result = verifyOTP(phone, otp);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in /otp/verify:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
});

// REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { username, password, role, name, phone } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and role are required",
      });
    }

    // OTP verification removed; phone number optional and no OTP needed

    const existingAdmin = await prisma.admin.findUnique({
      where: {
        username,
      },
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        username,
        passwordHash: hashedPassword,
        role: role.toUpperCase(),
        name: name || null,
        phone: phone || null,
      },
    });

    const token = jwt.sign(
      {
        adminId: newAdmin.id,
        role: newAdmin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        role: newAdmin.role,
        name: newAdmin.name,
        phone: newAdmin.phone,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// GOOGLE LOGIN / SIGNUP ROUTE
router.post("/google-login", async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google ID Token is required",
      });
    }

    let email = "";
    let name = "";

    // Determine if strict verification should be bypassed for mock developer environment
    const isMockClientId = !process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.includes("mockclientid");
    const isMockToken = token.startsWith("mock-");

    if (isMockClientId || isMockToken) {
      console.log("[GOOGLE AUTH] Bypass verification active (mock environment)");
      try {
        const decoded = jwt.decode(token) || {};
        email = decoded.email || (token.startsWith("mock-") ? token.replace("mock-", "") : "developer@estateelite.in");
        name = decoded.name || email.split("@")[0] || "Developer User";
      } catch (e) {
        email = token.includes("@") ? token : "developer@estateelite.in";
        name = email.split("@")[0] || "Developer User";
      }
    } else {
      // Validate Google ID Token using official google-auth-library
      const { OAuth2Client } = require("google-auth-library");
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          return res.status(401).json({
            success: false,
            message: "Invalid token payload received from Google",
          });
        }
        email = payload.email;
        name = payload.name || email.split("@")[0];
      } catch (err) {
        console.error("Google ID Token Verification Error:", err.message);
        return res.status(401).json({
          success: false,
          message: "Google authentication failed. Invalid token signature or expired credentials.",
        });
      }
    }

    let admin = await prisma.admin.findUnique({
      where: {
        username: email,
      },
    });

    if (!admin) {
      // Auto-register google user
      const dummyPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(dummyPassword, 10);

      admin = await prisma.admin.create({
        data: {
          username: email,
          passwordHash: hashedPassword,
          role: (role || "CLIENT").toUpperCase(),
          name: name,
          phone: null,
        },
      });
    } else if (role) {
      // If user exists, check role compatibility
      const dbRole = admin.role.toUpperCase();
      const reqRole = role.toUpperCase();
      const isMatch = (reqRole === 'ADMIN' && (dbRole === 'ADMIN' || dbRole === 'SUPER_ADMIN')) ||
                      (reqRole === dbRole);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: `This Google account is registered as a different role: ${admin.role}`,
        });
      }
    }

    const appToken = jwt.sign(
      {
        adminId: admin.id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token: appToken,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        name: admin.name,
        phone: admin.phone,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error during Google login",
    });
  }
});



// PROTECTED DASHBOARD ROUTE
router.get(
  "/dashboard",
  authMiddleware,
  async (req, res) => {

    res.json({
      success: true,
      message: "Welcome Admin Dashboard",
      admin: req.admin,
    });

  }
);


// APPROVE PROPERTY
router.patch(
  "/properties/:id/approve",
  authMiddleware,
  async (req, res) => {

    try {

      const { id } = req.params;

      const updatedProperty = await prisma.property.update({
        where: {
          id,
        },
        data: {
          status: "APPROVED",
        },
      });

      res.json({
        success: true,
        property: updatedProperty,
      });

    } catch (error) {

      handleRouteError(res, error);

    }

  }
);

//REJECT PROPERTY
router.patch(
  "/properties/:id/reject",
  authMiddleware,
  async (req, res) => {

    try {

      const { id } = req.params;

      const updatedProperty = await prisma.property.update({
        where: {
          id,
        },
        data: {
          status: "REJECTED",
        },
      });

      res.json({
        success: true,
        property: updatedProperty,
      });

    } catch (error) {

      handleRouteError(res, error);

    }

  }
);

//FEATURE TOGGLE FOR PROPERTY
router.patch(
  "/properties/:id/feature",
  authMiddleware,
  async (req, res) => {

    try {

      const { id } = req.params;
      const requestedFeatured = req.body?.featured;

      if (
        requestedFeatured !== undefined &&
        typeof requestedFeatured !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "featured must be a boolean",
        });
      }

      const property = await prisma.property.findUnique({
        where: {
          id,
        },
      });

      if (!property) {
        return propertyNotFound(res);
      }

      const nextFeatured =
        typeof requestedFeatured === "boolean"
          ? requestedFeatured
          : !property.featured;

      const updatedProperty = await prisma.property.update({
        where: {
          id,
        },
        data: {
          featured: nextFeatured,
        },
      });

      res.json({
        success: true,
        property: updatedProperty,
      });

    } catch (error) {

      handleRouteError(res, error);

    }

  }
);

//DELETE PROPERTY
router.delete(
  "/properties/:id",
  authMiddleware,
  async (req, res) => {

    try {

      const { id } = req.params;

      await prisma.property.delete({
        where: {
          id,
        },
      });

      res.json({
        success: true,
        message: "Property deleted",
      });

    } catch (error) {

      handleRouteError(res, error);

    }

  }
);

// ADMIN ALL PROPERTIES
router.get(
  "/properties",
  authMiddleware,
  async (req, res) => {

    try {

      const { status } = req.query;
      const normalizedStatus =
        typeof status === "string" ? status.toUpperCase() : "";

      if (normalizedStatus && !MODERATION_STATUSES.has(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid property status",
        });
      }

      const properties = await prisma.property.findMany({

        where: normalizedStatus
          ? {
              status: normalizedStatus,
            }
          : {},

        orderBy: {
          createdAt: "desc",
        },

      });

      res.json({
        success: true,
        properties,
      });

    } catch (error) {

      handleRouteError(res, error);

    }

  }
);

// CREATE PROPERTY
router.post(
  "/properties/create",
  authMiddleware,
  async (req, res) => {

    try {

      const validationMessage = validatePropertyPayload(req.body);

      if (validationMessage) {
        return res.status(400).json({
          success: false,
          message: validationMessage,
        });
      }

      const property = await prisma.property.create({

        data: propertyCreateData(req.body, "PENDING"),

      });

      res.json({
        success: true,
        property,
      });

    } catch (error) {

      handleRouteError(res, error);

    }

  }
);

module.exports = router;
