const mechanicSecurity = [{ cookieAuth: [] }];

const mechanicPaths = {
  "/api/mechanic/dashboard": {
    get: {
      tags: ["Mechanic"],
      summary: "Get mechanic dashboard",
      security: mechanicSecurity,
      responses: { 200: { description: "Dashboard data fetched" } }
    }
  },
  "/api/mechanic/pending-tasks": {
    get: {
      tags: ["Mechanic"],
      summary: "Get pending tasks",
      security: mechanicSecurity,
      responses: { 200: { description: "Pending tasks fetched" } }
    }
  },
  "/api/mechanic/pending-tasks/{id}/accept": {
    post: {
      tags: ["Mechanic"],
      summary: "Accept pending task",
      security: mechanicSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Task accepted" } }
    }
  },
  "/api/mechanic/pending-tasks/{id}/decline": {
    post: {
      tags: ["Mechanic"],
      summary: "Decline pending task",
      security: mechanicSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Task declined" } }
    }
  },
  "/api/mechanic/current-tasks": {
    get: {
      tags: ["Mechanic"],
      summary: "Get current tasks",
      security: mechanicSecurity,
      responses: { 200: { description: "Current tasks fetched" } }
    }
  },
  "/api/mechanic/past-tasks": {
    get: {
      tags: ["Mechanic"],
      summary: "Get past tasks",
      security: mechanicSecurity,
      responses: { 200: { description: "Past tasks fetched" } }
    }
  },
  "/api/mechanic/vehicle-details/{id}": {
    get: {
      tags: ["Mechanic"],
      summary: "Get vehicle details",
      security: mechanicSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Vehicle details fetched" } }
    }
  },
  "/api/mechanic/submit-review/{id}": {
    post: {
      tags: ["Mechanic"],
      summary: "Submit vehicle inspection review",
      security: mechanicSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Review submitted" } }
    }
  },
  "/api/mechanic/inspection/schedule": {
    post: {
      tags: ["Mechanic"],
      summary: "Schedule inspection",
      security: mechanicSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object" } } }
      },
      responses: { 200: { description: "Inspection scheduled" } }
    }
  },
  "/api/mechanic/submit-inspection/{auctionId}": {
    post: {
      tags: ["Mechanic"],
      summary: "Submit full inspection report",
      security: mechanicSecurity,
      parameters: [{ name: "auctionId", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object" } } }
      },
      responses: { 200: { description: "Inspection submitted" } }
    }
  },
  "/api/mechanic/profile": {
    get: {
      tags: ["Mechanic"],
      summary: "Get mechanic profile",
      security: mechanicSecurity,
      responses: { 200: { description: "Profile fetched" } }
    }
  },
  "/api/mechanic/change-password": {
    post: {
      tags: ["Mechanic"],
      summary: "Change mechanic password",
      security: mechanicSecurity,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["oldPassword", "newPassword", "confirmPassword"],
              properties: {
                oldPassword: { type: "string" },
                newPassword: { type: "string", minLength: 8 },
                confirmPassword: { type: "string", minLength: 8 }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Password changed" } }
    }
  }
};

export default mechanicPaths;
