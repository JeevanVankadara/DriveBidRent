const buyerSecurity = [{ cookieAuth: [] }];

const buyerPaths = {
  "/api/buyer/dashboard": {
    get: {
      tags: ["Buyer"],
      summary: "Get buyer dashboard",
      security: buyerSecurity,
      responses: { 200: { description: "Dashboard data loaded" }, 401: { $ref: "#/components/responses/Unauthorized" } }
    }
  },
  "/api/buyer/auctions": {
    get: {
      tags: ["Buyer"],
      summary: "Get auctions list",
      security: buyerSecurity,
      responses: { 200: { description: "Auctions fetched" } }
    }
  },
  "/api/buyer/auctions/{id}": {
    get: {
      tags: ["Buyer"],
      summary: "Get single auction details",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Auction details fetched" } }
    }
  },
  "/api/buyer/auction/place-bid": {
    post: {
      tags: ["Buyer"],
      summary: "Place bid on an auction",
      security: buyerSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/PlaceBidRequest" } } }
      },
      responses: { 200: { description: "Bid placed" }, 400: { $ref: "#/components/responses/ValidationError" } }
    }
  },
  "/api/buyer/rentals": {
    get: {
      tags: ["Buyer"],
      summary: "Get rentals list",
      security: buyerSecurity,
      responses: { 200: { description: "Rentals fetched" } }
    }
  },
  "/api/buyer/rentals/{id}": {
    get: {
      tags: ["Buyer"],
      summary: "Get single rental details",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Rental details fetched" } }
    }
  },
  "/api/buyer/rentals/book": {
    post: {
      tags: ["Buyer"],
      summary: "Book a rental",
      security: buyerSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/BookRentalRequest" } } }
      },
      responses: { 200: { description: "Rental booked" } }
    }
  },
  "/api/buyer/purchases": {
    get: {
      tags: ["Buyer"],
      summary: "Get buyer purchases",
      security: buyerSecurity,
      responses: { 200: { description: "Purchases fetched" } }
    }
  },
  "/api/buyer/purchases/{id}": {
    get: {
      tags: ["Buyer"],
      summary: "Get purchase details",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Purchase details fetched" } }
    }
  },
  "/api/buyer/wishlist": {
    get: {
      tags: ["Buyer"],
      summary: "Get buyer wishlist",
      security: buyerSecurity,
      responses: { 200: { description: "Wishlist fetched" } }
    },
    post: {
      tags: ["Buyer"],
      summary: "Add item to wishlist",
      security: buyerSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/WishlistRequest" } } }
      },
      responses: { 200: { description: "Wishlist updated" } }
    },
    delete: {
      tags: ["Buyer"],
      summary: "Remove item from wishlist",
      security: buyerSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/WishlistRequest" } } }
      },
      responses: { 200: { description: "Wishlist item removed" } }
    }
  },
  "/api/buyer/profile": {
    get: {
      tags: ["Buyer"],
      summary: "Get buyer profile",
      security: buyerSecurity,
      responses: { 200: { description: "Profile fetched" } }
    },
    put: {
      tags: ["Buyer"],
      summary: "Update buyer profile",
      security: buyerSecurity,
      responses: { 200: { description: "Profile updated" } }
    }
  },
  "/api/buyer/change-password": {
    post: {
      tags: ["Buyer"],
      summary: "Change buyer password",
      security: buyerSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordRequest" } } }
      },
      responses: { 200: { description: "Password changed" } }
    }
  },
  "/api/buyer/notifications": {
    get: {
      tags: ["Buyer"],
      summary: "Get buyer notifications",
      security: buyerSecurity,
      responses: { 200: { description: "Notifications fetched" } }
    }
  },
  "/api/buyer/notifications/{id}/read": {
    put: {
      tags: ["Buyer"],
      summary: "Mark one notification as read",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Notification updated" } }
    }
  },
  "/api/buyer/upload/photo": {
    post: {
      tags: ["Buyer"],
      summary: "Upload buyer profile photo",
      security: buyerSecurity,
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                profilePhoto: { type: "string", format: "binary" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Photo uploaded" } }
    }
  }
};

export default buyerPaths;
