import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "https://api-doktarant.tashmeduni.uz";

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "url parametri kerak" }, { status: 400 });
  }

  let fileUrl: string;
  if (urlParam.startsWith("http")) {
    if (!urlParam.startsWith(API_BASE)) {
      return NextResponse.json({ error: "Ruxsat etilmagan URL" }, { status: 403 });
    }
    fileUrl = urlParam;
  } else {
    fileUrl = API_BASE + (urlParam.startsWith("/") ? urlParam : `/${urlParam}`);
  }

  try {
    const res = await fetch(fileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PhD-Client/1.0)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = res.headers.get("content-disposition");
    const blob = await res.blob();

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition || `attachment; filename="${(fileUrl.split("/").pop()?.split("?")[0] || "file").replace(/"/g, "%22")}"`,
    };

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Proxy file error:", err);
    return NextResponse.json({ error: "Faylni yuklashda xatolik" }, { status: 500 });
  }
}
