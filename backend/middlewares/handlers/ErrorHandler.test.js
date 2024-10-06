const request = require("supertest");
const { app, server } = require("../../../index");

describe("errorHandler", () => {
    it("should handle not exist routes error", async () => {
        const response = await request(app).get("/notexistent-route");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            status: 404,
            statusCode: 404,
            statusText: expect.stringContaining("Not Found"),
            message: expect.stringContaining("Not Found"),
        });
    });

    afterAll(() => {
        server.close();
    });
});
