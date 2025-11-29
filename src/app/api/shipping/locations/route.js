import { NextResponse } from "next/server";

const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = process.env.RAJAONGKIR_BASE_URL;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!API_KEY) {
    return NextResponse.json(
      { success: false, message: "API Key Missing" },
      { status: 500 }
    );
  }

  try {
    let url = "";

    if (type === "province") {
      url = `${BASE_URL}/destination/province`;
    } else if (type === "city") {
      if (!id) throw new Error("Province ID is required");
      url = `${BASE_URL}/destination/city/${id}`;
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid type" },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { key: API_KEY },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const json = await response.json();

    if (json.meta?.code !== 200) {
      throw new Error(json.meta?.message || "Failed to fetch data");
    }

    if (!json.data) {
      return NextResponse.json({ success: true, data: [] });
    }

    let results = Array.isArray(json.data) ? json.data : [json.data];

    results = results.map((item) => ({
      province_id: item.province_id || item.id,
      city_id: item.id,
      province: item.province_name || item.name,
      city_name: item.name,
      type: item.type || "Kota",
      postal_code: item.zip_code,
    }));

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
