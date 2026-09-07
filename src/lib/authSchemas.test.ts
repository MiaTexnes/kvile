import { describe, expect, it } from "vitest"
import { loginFormSchema, registerFormSchema } from "./authSchemas"

describe("registerFormSchema", () => {
  it("accepts a valid stud.noroff.no customer payload", () => {
    const parsed = registerFormSchema.parse({
      name: "test_user",
      email: "someone@stud.noroff.no",
      password: "password1",
      venueManager: false,
    })
    expect(parsed.venueManager).toBe(false)
  })

  it("rejects non-stud emails", () => {
    const result = registerFormSchema.safeParse({
      name: "tester",
      email: "a@gmail.com",
      password: "password1",
      venueManager: false,
    })
    expect(result.success).toBe(false)
  })

  it("rejects short display names", () => {
    const result = registerFormSchema.safeParse({
      name: "x",
      email: "a@stud.noroff.no",
      password: "password1",
      venueManager: false,
    })
    expect(result.success).toBe(false)
  })

  it("rejects spaces in display name", () => {
    const result = registerFormSchema.safeParse({
      name: "bad name",
      email: "a@stud.noroff.no",
      password: "password1",
      venueManager: false,
    })
    expect(result.success).toBe(false)
  })
})

describe("loginFormSchema", () => {
  it("requires a non-empty password", () => {
    const result = loginFormSchema.safeParse({
      email: "a@stud.noroff.no",
      password: "",
    })
    expect(result.success).toBe(false)
  })

  it("accepts a minimal valid login", () => {
    const parsed = loginFormSchema.parse({
      email: "student@stud.noroff.no",
      password: "any",
    })
    expect(parsed.email).toContain("stud.noroff.no")
  })
})
