import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Mpesa } from "../src/client.js";
import { HttpClient } from "../src/http.js";

describe("Mpesa HTTP Integration", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should send a sandbox payment using HttpClient", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          transactionId: "MOCK-123",
          status: "success",
          message: "Mock payment successful",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    vi.stubGlobal("fetch", mockFetch);

    const httpClient = new HttpClient({
      baseUrl: "https://example.com/mock/",
    });

    const mpesa = new Mpesa(
      {
        apiKey: "test-api-key",
        environment: "sandbox",
      },
      httpClient
    );

    const response = await mpesa.payment({
      phone: "258841234567",
      amount: 1500,
      reference: "ORDER-001",
    });

    expect(response.transactionId).toBe("MOCK-123");
    expect(response.status).toBe("success");

    expect(mockFetch).toHaveBeenCalledWith(
      new URL("https://example.com/mock/payment"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          phone: "258841234567",
          amount: 1500,
          reference: "ORDER-001",
        }),
      })
    );
  });

  it("should reject production payments", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const httpClient = new HttpClient({
      baseUrl: "https://example.com/mock/",
    });

    const mpesa = new Mpesa(
      {
        apiKey: "test-api-key",
        environment: "production",
      },
      httpClient
    );

    await expect(
      mpesa.payment({
        phone: "258841234567",
        amount: 1500,
      })
    ).rejects.toMatchObject({
      code: "NOT_IMPLEMENTED",
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should require a configured sandbox transport", async () => {
    const mpesa = new Mpesa({
      apiKey: "test-api-key",
      environment: "sandbox",
    });

    await expect(
      mpesa.payment({
        phone: "258841234567",
        amount: 1500,
      })
    ).rejects.toMatchObject({
      code: "TRANSPORT_NOT_CONFIGURED",
    });
  });

  it("should not send HTTP requests for invalid payments", async () => {
    const mockFetch = vi.fn();

    vi.stubGlobal("fetch", mockFetch);

    const httpClient = new HttpClient({
        baseUrl: "https://example.com/mock/",
    });

    const mpesa = new Mpesa(
        {
        apiKey: "test-api-key",
        environment: "sandbox",
        },
        httpClient
    );

    await expect(
        mpesa.payment({
        phone: "123456",
        amount: -100,
        })
    ).rejects.toMatchObject({
        code: "INVALID_PHONE",
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
