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
  }
};

export default mechanicPaths;
