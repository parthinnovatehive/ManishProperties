const express = require("express");

const prisma = require("../lib/prisma");
const {
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

// PUBLIC PROPERTY LIST ROUTE
router.get("/properties", async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: "APPROVED",
      },
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
});

// PUBLIC PROPERTY SUBMISSION ROUTE
router.post("/properties/submit", async (req, res) => {
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

    res.status(201).json({
      success: true,
      property,
    });
  } catch (error) {
    handleRouteError(res, error);
  }
});

// SINGLE PUBLIC PROPERTY ROUTE
router.get("/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findFirst({
      where: {
        id,
        status: "APPROVED",
      },
    });

    if (!property) {
      return propertyNotFound(res);
    }

    res.json({
      success: true,
      property,
    });
  } catch (error) {
    handleRouteError(res, error);
  }
});

module.exports = router;
