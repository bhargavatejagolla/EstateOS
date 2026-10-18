import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { cleanDb } from "../test/helpers.js";

function getCookie(res: request.Response): string {
  const cookies = res.headers["set-cookie"];
  if (Array.isArray(cookies)) return cookies[0] || "";
  return String(cookies || "");
}

describe("Auth", () => {
  beforeEach(cleanDb);

  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Owner One",
      email: "o1@test.com",
      password: "password123",
      role: "OWNER",
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("o1@test.com");
    expect(res.body.accessToken).toBeTruthy();
    expect(getCookie(res)).toMatch(/refresh_token/);
  });

  it("rejects duplicate email with 409", async () => {
    await request(app).post("/api/auth/register").send({
      name: "User A",
      email: "dup@test.com",
      password: "password123",
      role: "RENTER",
    });
    const res = await request(app).post("/api/auth/register").send({
      name: "User B",
      email: "dup@test.com",
      password: "password123",
      role: "RENTER",
    });
    expect(res.status).toBe(409);
  });

  it("rejects wrong password with 401", async () => {
    await request(app).post("/api/auth/register").send({
      name: "User U",
      email: "u@test.com",
      password: "password123",
      role: "RENTER",
    });
    const res = await request(app).post("/api/auth/login").send({
      email: "u@test.com",
      password: "wrongpass",
    });
    expect(res.status).toBe(401);
  });

  it("rotates refresh tokens on /refresh", async () => {
    const reg = await request(app).post("/api/auth/register").send({
      name: "User R",
      email: "r@test.com",
      password: "password123",
      role: "OWNER",
    });
    const cookie = getCookie(reg);
    const res = await request(app).post("/api/auth/refresh").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(getCookie(res)).not.toBe(cookie);
  });

  it("detects replay of a revoked refresh token and revokes all sessions", async () => {
    const reg = await request(app).post("/api/auth/register").send({
      name: "R2",
      email: "r2@test.com",
      password: "password123",
      role: "OWNER",
    });
    const oldCookie = getCookie(reg);

    // Normal refresh — old cookie is now revoked
    const refreshRes = await request(app).post("/api/auth/refresh").set("Cookie", oldCookie);
    expect(refreshRes.status).toBe(200);

    // Replay with the SAME old cookie → must fail
    const replay = await request(app).post("/api/auth/refresh").set("Cookie", oldCookie);
    expect(replay.status).toBe(401);
  });
});
