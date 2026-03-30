export const schemas = {
  ApiResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Request successful" },
      data: { type: "object", additionalProperties: true }
    }
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed" }
    }
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      password: { type: "string", example: "Password123" }
    }
  },
  SignupRequest: {
    type: "object",
    required: ["firstName", "lastName", "email", "password", "userType", "phone", "dateOfBirth", "termsAccepted"],
    properties: {
      firstName: { type: "string", example: "Aman" },
      lastName: { type: "string", example: "Patel" },
      email: { type: "string", format: "email", example: "aman@example.com" },
      password: { type: "string", example: "Password123" },
      userType: {
        type: "string",
        enum: ["buyer", "seller", "driver", "mechanic", "admin", "auction_manager", "superadmin"],
        example: "buyer"
      },
      phone: { type: "string", example: "9876543210" },
      dateOfBirth: { type: "string", format: "date", example: "2000-06-15" },
      termsAccepted: { type: "boolean", example: true },
      doorNo: { type: "string", example: "12A" },
      street: { type: "string", example: "MG Road" },
      city: { type: "string", example: "Kochi" },
      state: { type: "string", example: "Kerala" }
    }
  },
  WishlistRequest: {
    type: "object",
    properties: {
      auctionId: { type: "string", example: "67f9f50c3f1f7cc4abfe1029" },
      rentalId: { type: "string", example: "67f9f50c3f1f7cc4abfe1030" },
      type: { type: "string", enum: ["auction", "rental"], example: "auction" }
    }
  },
  PlaceBidRequest: {
    type: "object",
    required: ["auctionId", "bidAmount"],
    properties: {
      auctionId: { type: "string", example: "67f9f50c3f1f7cc4abfe1029" },
      bidAmount: { type: "number", example: 550000 }
    }
  },
  BookRentalRequest: {
    type: "object",
    required: ["rentalId"],
    properties: {
      rentalId: { type: "string", example: "67f9f50c3f1f7cc4abfe1030" },
      days: { type: "number", example: 3 },
      pickupDate: { type: "string", format: "date", example: "2026-04-15" },
      paymentMethod: { type: "string", example: "upi" }
    }
  },
  MessageRequest: {
    type: "object",
    required: ["content"],
    properties: {
      content: { type: "string", example: "Hello, is this vehicle still available?" }
    }
  },
  ChangePasswordRequest: {
    type: "object",
    required: ["oldPassword", "newPassword", "confirmPassword"],
    properties: {
      oldPassword: { type: "string", example: "OldPass123" },
      newPassword: { type: "string", example: "NewPass123" },
      confirmPassword: { type: "string", example: "NewPass123" }
    }
  }
};

export const responses = {
  Unauthorized: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" }
      }
    }
  },
  ValidationError: {
    description: "Validation error",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" }
      }
    }
  },
  ServerError: {
    description: "Server error",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" }
      }
    }
  }
};
