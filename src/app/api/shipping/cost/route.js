import { NextResponse } from "next/server";

// Ambil Config
const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = process.env.RAJAONGKIR_BASE_URL;
const ORIGIN_CITY = process.env.STORE_CITY_ID || "256"; // Default Malang

export async function POST(request) {
  try {
    const body = await request.json();
    const { destination, weight, courier } = body;

    // --- LOGGING ---
    console.log("-----------------------------------------");
    console.log("📡 Hitung Ongkir (Komerce)");
    console.log("   API Key:", API_KEY ? "✅ Loaded" : "❌ Missing");
    console.log("   Asal:", ORIGIN_CITY);
    console.log("   Tujuan:", destination);
    console.log("   Berat:", weight);
    console.log("   Kurir:", courier);
    console.log("-----------------------------------------");

    if (!API_KEY) {
      return NextResponse.json(
        { success: false, message: "API Key Server Hilang" },
        { status: 500 }
      );
    }

    if (!destination || !weight || !courier) {
      return NextResponse.json(
        { success: false, message: "Data pengiriman tidak lengkap" },
        { status: 400 }
      );
    }

    // 1. Endpoint Komerce
    const url = `${BASE_URL}/calculate/domestic-cost`;

    // 2. Payload WAJIB x-www-form-urlencoded (Bukan JSON!)
    // Dokumentasi Komerce meminta format ini.
    const params = new URLSearchParams();
    params.append("origin", ORIGIN_CITY);
    params.append("originType", "city"); // Wajib di Komerce
    params.append("destination", destination);
    params.append("destinationType", "city"); // Wajib di Komerce
    params.append("weight", weight);
    params.append("courier", courier);

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
      console.error("❌ Komerce Error:", JSON.stringify(json, null, 2));
      throw new Error(json.meta?.message || "Gagal hitung ongkir (API Error)");
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

    return NextResponse.json({
      success: true,
      data: { costs: results },
    });
  } catch (error) {
    console.error("💥 Fatal Cost Error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
