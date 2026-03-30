const sellerSecurity = [{ cookieAuth: [] }];

const sellerPaths = {
  "/api/seller/add-auction": {
    post: {
      tags: ["Seller"],
      summary: "Create auction listing",
      security: sellerSecurity,
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                vehicleImage: {
                  type: "array",
                  items: { type: "string", format: "binary" }
                }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Auction created" } }
    }
  },
  "/api/seller/add-rental": {
    post: {
      tags: ["Seller"],
      summary: "Create rental listing",
      security: sellerSecurity,
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                vehicleImage: { type: "string", format: "binary" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Rental created" } }
    }
  },
  "/api/seller/profile": {
    get: {
      tags: ["Seller"],
      summary: "Get seller profile",
      security: sellerSecurity,
      responses: { 200: { description: "Profile fetched" } }
    }
  },
  "/api/seller/update-profile": {
    post: {
      tags: ["Seller"],
      summary: "Update seller profile",
      security: sellerSecurity,
      responses: { 200: { description: "Profile updated" } }
    }
  },
  "/api/seller/change-password": {
    post: {
      tags: ["Seller"],
      summary: "Change seller password",
      security: sellerSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordRequest" } } }
      },
      responses: { 200: { description: "Password changed" } }
    }
  },
  "/api/seller/view-auctions": {
    get: {
      tags: ["Seller"],
      summary: "Get seller auctions",
      security: sellerSecurity,
      responses: { 200: { description: "Auctions fetched" } }
    }
  },
  "/api/seller/view-bids/{id}": {
    get: {
      tags: ["Seller"],
      summary: "View bids for an auction",
      security: sellerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Bids fetched" } }
    }
  },
  "/api/seller/accept-bid/{id}": {
    put: {
      tags: ["Seller"],
      summary: "Accept bid",
      security: sellerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Bid accepted" } }
    }
  },
  "/api/seller/reject-bid/{id}": {
    put: {
      tags: ["Seller"],
      summary: "Reject bid",
      security: sellerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Bid rejected" } }
    }
  },
  "/api/seller/view-rentals": {
    get: {
      tags: ["Seller"],
      summary: "Get seller rentals",
      security: sellerSecurity,
      responses: { 200: { description: "Rentals fetched" } }
    }
  }
};

export default sellerPaths;
