const auctionManagerSecurity = [{ cookieAuth: [] }];

const auctionManagerPaths = {
  "/api/auctionmanager/dashboard": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get auction manager dashboard",
      security: auctionManagerSecurity,
      responses: { 200: { description: "Dashboard data fetched" } }
    }
  },
  "/api/auctionmanager/requests": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get auction requests",
      security: auctionManagerSecurity,
      responses: { 200: { description: "Requests fetched" } }
    }
  },
  "/api/auctionmanager/pending": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get pending inspection vehicles",
      security: auctionManagerSecurity,
      responses: { 200: { description: "Pending list fetched" } }
    }
  },
  "/api/auctionmanager/assign-mechanic/{id}": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get assign mechanic page data",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Data loaded" } }
    },
    post: {
      tags: ["Auction Manager"],
      summary: "Assign mechanic to vehicle",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Mechanic assigned" } }
    }
  },
  "/api/auctionmanager/start-auction/{id}": {
    post: {
      tags: ["Auction Manager"],
      summary: "Start auction",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Auction started" } }
    }
  },
  "/api/auctionmanager/stop-auction/{id}": {
    post: {
      tags: ["Auction Manager"],
      summary: "Stop auction",
      security: auctionManagerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Auction stopped" } }
    }
  },
  "/api/auctionmanager/profile": {
    get: {
      tags: ["Auction Manager"],
      summary: "Get auction manager profile",
      security: auctionManagerSecurity,
      responses: { 200: { description: "Profile fetched" } }
    }
  }
};

export default auctionManagerPaths;
