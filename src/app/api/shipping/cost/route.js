import { NextResponse } from "next/server";
import { shippingCostSchema } from "@/lib/validations";
import { apiLimiter } from "@/lib/rateLimiter";
import logger from "@/lib/logger";
import { z } from "zod";

// Ambil Config
const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = process.env.RAJAONGKIR_BASE_URL;
const ORIGIN_CITY = process.env.STORE_CITY_ID || "256"; // Default Malang

export async function POST(request) {
  try {
    // Apply rate limiting
    const limitResponse = await apiLimiter(request);
    if (limitResponse) return limitResponse;

    if (!API_KEY) {
      logger.error("RajaOngkir API key missing", null, {
        endpoint: "shipping/cost",
      });

      return NextResponse.json(
        { success: false, message: "API Key Server Hilang" },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate input
    try {
      const validated = shippingCostSchema.parse(body);

      logger.info("Shipping cost calculation requested", {
        destination: validated.destination,
        weight: validated.weight,
        courier: validated.courier,
      });

      // 1. Endpoint Komerce
      const url = `${BASE_URL}/calculate/domestic-cost`;

      // 2. Payload WAJIB x-www-form-urlencoded (Bukan JSON!)
      // Dokumentasi Komerce meminta format ini.
      const params = new URLSearchParams();
      params.append("origin", ORIGIN_CITY);
      params.append("originType", "city"); // Wajib di Komerce
      params.append("destination", validated.destination);
      params.append("destinationType", "city"); // Wajib di Komerce
      params.append("weight", validated.weight);
      params.append("courier", validated.courier);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          key: API_KEY,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const json = await response.json();

      // 3. Cek Error Komerce
      // Komerce mengembalikan { meta: { code: 200 }, data: [...] }
      if (json.meta?.code !== 200) {
        logger.warn("RajaOngkir API error", {
          code: json.meta?.code,
          message: json.meta?.message,
          destination: validated.destination,
          courier: validated.courier,
        });

        throw new Error(
          json.meta?.message || "Gagal hitung ongkir (API Error)"
        );
      }

      // 4. Mapping Data ke Format Frontend
      // Komerce structure: data: [ { service, description, cost, etd } ]
      const results = json.data.map((item) => ({
        service: item.service,
        description: item.description,
        cost: [
          {
            value: item.cost,
            etd: item.etd || "-",
          },
        ],
      }));

      logger.business("Shipping cost calculated", {
        destination: validated.destination,
        weight: validated.weight,
        courier: validated.courier,
        resultsCount: results.length,
      });

      return NextResponse.json({
        success: true,
        data: { costs: results },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Shipping cost validation failed", {
          errors: error.errors,
        });

        return NextResponse.json(
          {
            success: false,
            message: "Data pengiriman tidak valid",
            errors: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    logger.error("Shipping cost calculation failed", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
