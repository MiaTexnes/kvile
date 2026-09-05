import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { ContactPage } from "./ContactPage"

describe("ContactPage", () => {
  it("shows validation when the message is too short", async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <ContactPage />
      </BrowserRouter>,
    )
    await user.type(screen.getByLabelText(/message/i), "short")
    await user.click(screen.getByRole("button", { name: /open in email app/i }))
    expect(await screen.findByRole("alert")).toHaveTextContent(/10 characters/)
  })
})
