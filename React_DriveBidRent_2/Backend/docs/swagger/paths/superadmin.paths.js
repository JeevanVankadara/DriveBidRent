const superadminSecurity = [{ cookieAuth: [] }];

const superadminPaths = {
  "/api/superadmin/dashboard": {
    get: {
      tags: ["Superadmin"],
      summary: "Get superadmin dashboard",
      security: superadminSecurity,
      responses: { 200: { description: "Dashboard fetched" } }
    }
  },
  "/api/superadmin/analytics": {
    get: {
      tags: ["Superadmin"],
      summary: "Get superadmin analytics",
      security: superadminSecurity,
      responses: { 200: { description: "Analytics fetched" } }
    }
  },
  "/api/superadmin/user-activities": {
    get: {
      tags: ["Superadmin"],
      summary: "Get user activity list",
      security: superadminSecurity,
      responses: { 200: { description: "User activities fetched" } }
    }
  },
  "/api/superadmin/user-details/{id}": {
    get: {
      tags: ["Superadmin"],
      summary: "Get one user details",
      security: superadminSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "User details fetched" } }
    }
  },
  "/api/superadmin/revenue": {
    get: {
      tags: ["Superadmin"],
      summary: "Get revenue report",
      security: superadminSecurity,
      responses: { 200: { description: "Revenue data fetched" } }
    }
  },
  "/api/superadmin/trends": {
    get: {
      tags: ["Superadmin"],
      summary: "Get growth trends",
      security: superadminSecurity,
      responses: { 200: { description: "Trends fetched" } }
    }
  },
  "/api/superadmin/profile": {
    get: {
      tags: ["Superadmin"],
      summary: "Get superadmin profile",
      security: superadminSecurity,
      responses: { 200: { description: "Profile fetched" } }
    }
  },
  "/api/superadmin/update-password": {
    post: {
      tags: ["Superadmin"],
      summary: "Update superadmin password",
      security: superadminSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordRequest" } } }
      },
      responses: { 200: { description: "Password updated" } }
    }
  }
};

export default superadminPaths;
