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
  "/api/buyer/buyer_dashboard": {
    get: {
      tags: ["Buyer"],
      summary: "Buyer dashboard legacy endpoint",
      security: buyerSecurity,
      responses: { 200: { description: "Dashboard loaded" } }
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
  "/api/buyer/auction/winner-status/{id}": {
    get: {
      tags: ["Buyer"],
      summary: "Get winner status for auction",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Winner status fetched" } }
    }
  },
  "/api/buyer/auction/confirm-payment/{id}": {
    get: {
      tags: ["Buyer"],
      summary: "Get payment confirmation data",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Payment confirmation data fetched" } }
    }
  },
  "/api/buyer/auction/complete-payment/{id}": {
    post: {
      tags: ["Buyer"],
      summary: "Complete auction payment",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Payment completed" } }
    }
  },
  "/api/buyer/auctions/{id}/completed": {
    get: {
      tags: ["Buyer"],
      summary: "Get completed auction details",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Completed auction details fetched" } }
    }
  },
  "/api/buyer/bids": {
    get: {
      tags: ["Buyer"],
      summary: "Get buyer bids",
      security: buyerSecurity,
      responses: { 200: { description: "Bids fetched" } }
    }
  },
  "/api/buyer/buyer_dashboard/my-bids": {
    get: {
      tags: ["Buyer"],
      summary: "Get buyer bids legacy endpoint",
      security: buyerSecurity,
      responses: { 200: { description: "Bids fetched" } }
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
  "/api/buyer/rental": {
    get: {
      tags: ["Buyer"],
      summary: "Rental legacy redirect endpoint",
      security: buyerSecurity,
      responses: { 200: { description: "Redirect or rental response" } }
    },
    post: {
      tags: ["Buyer"],
      summary: "Book rental legacy endpoint",
      security: buyerSecurity,
      responses: { 200: { description: "Rental booked" } }
    }
  },
  "/api/buyer/rentals/{id}/reviews": {
    post: {
      tags: ["Buyer"],
      summary: "Add review for rental",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Review added" } }
    },
    get: {
      tags: ["Buyer"],
      summary: "Get reviews for rental",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Reviews fetched" } }
    }
  },
  "/api/buyer/rentals/{id}/can-review": {
    get: {
      tags: ["Buyer"],
      summary: "Check whether buyer can review rental",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Can-review status fetched" } }
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
  "/api/buyer/purchase": {
    get: {
      tags: ["Buyer"],
      summary: "Get purchases legacy endpoint",
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
  "/api/buyer/purchase_details": {
    get: {
      tags: ["Buyer"],
      summary: "Get purchase details legacy endpoint",
      security: buyerSecurity,
      responses: { 200: { description: "Purchase details fetched" } }
    }
  },
  "/api/buyer/rental_details/{id}": {
    get: {
      tags: ["Buyer"],
      summary: "Get rental purchase details",
      security: buyerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Rental purchase details fetched" } }
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
  "/api/buyer/api/wishlist": {
    get: {
      tags: ["Buyer"],
      summary: "Get wishlist legacy API endpoint",
      security: buyerSecurity,
      responses: { 200: { description: "Wishlist fetched" } }
    },
    post: {
      tags: ["Buyer"],
      summary: "Add wishlist item legacy API endpoint",
      security: buyerSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/WishlistRequest" } } }
      },
      responses: { 200: { description: "Wishlist updated" } }
    },
    delete: {
      tags: ["Buyer"],
      summary: "Delete wishlist item legacy API endpoint",
      security: buyerSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/WishlistRequest" } } }
      },
      responses: { 200: { description: "Wishlist item removed" } }
    }
  },
  "/api/buyer/payment/create-checkout-session": {
    post: {
      tags: ["Buyer"],
      summary: "Create Stripe checkout session",
      security: buyerSecurity,
      responses: { 200: { description: "Checkout session created" } }
    }
  },
  "/api/buyer/payment/verify-session": {
    get: {
      tags: ["Buyer"],
      summary: "Verify checkout session",
      security: buyerSecurity,
      responses: { 200: { description: "Session verified" } }
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
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/BuyerProfileUpdateRequest" }
          }
        }
      },
      responses: {
        200: { description: "Profile updated" },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/Unauthorized" }
      }
    }
  },
  "/api/buyer/update-profile": {
    post: {
      tags: ["Buyer"],
      summary: "Update buyer profile legacy endpoint",
      security: buyerSecurity,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/BuyerProfileUpdateRequest" }
          }
        }
      },
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
  "/api/buyer/notifications/seen": {
    put: {
      tags: ["Buyer"],
      summary: "Clear notification flag",
      security: buyerSecurity,
      responses: { 200: { description: "Notification flag cleared" } }
    }
  },
  "/api/buyer/notifications/mark-all-read": {
    post: {
      tags: ["Buyer"],
      summary: "Mark all notifications as read",
      security: buyerSecurity,
      responses: { 200: { description: "All notifications marked read" } }
    }
  },
  "/api/buyer/notifications/unread-count": {
    get: {
      tags: ["Buyer"],
      summary: "Get unread notification count",
      security: buyerSecurity,
      responses: { 200: { description: "Unread count fetched" } }
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
  },
  "/api/buyer/about": {
    get: {
      tags: ["Buyer"],
      summary: "About page data",
      responses: { 200: { description: "About data fetched" } }
    }
  },
  "/api/buyer/aboutus": {
    get: {
      tags: ["Buyer"],
      summary: "About us page data",
      responses: { 200: { description: "About us data fetched" } }
    }
  }
};

export default buyerPaths;
