const adminSecurity = [{ cookieAuth: [] }];

const adminPaths = {
  "/api/admin/admin": {
    get: {
      tags: ["Admin"],
      summary: "Get admin dashboard",
      security: adminSecurity,
      responses: { 200: { description: "Dashboard fetched" } }
    }
  },
  "/api/admin/manage-user": {
    get: {
      tags: ["Admin"],
      summary: "Get user management data",
      security: adminSecurity,
      responses: { 200: { description: "Users fetched" } }
    }
  },
  "/api/admin/user-details/{id}": {
    get: {
      tags: ["Admin"],
      summary: "Get one user details",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "User details fetched" } }
    }
  },
  "/api/admin/block-user/{id}": {
    post: {
      tags: ["Admin"],
      summary: "Block a user",
      security: adminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "User blocked" } }
    }
  },
  "/api/admin/analytics": {
    get: {
      tags: ["Admin"],
      summary: "Get admin analytics",
      security: adminSecurity,
      responses: { 200: { description: "Analytics fetched" } }
    }
  },
  "/api/admin/manage-earnings": {
    get: {
      tags: ["Admin"],
      summary: "Get earnings management data",
      security: adminSecurity,
      responses: { 200: { description: "Earnings fetched" } }
    }
  }
};

export default adminPaths;
