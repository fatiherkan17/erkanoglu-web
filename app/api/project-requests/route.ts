import "dotenv/config";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


export async function GET() {
  try {
    const projectRequests = await prisma.projectRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projectRequests, { status: 200 });
  } catch (error) {
    console.error("Project requests GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Proje talepleri alınamadı.",
      },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("PROJECT REQUEST BODY:", body);

    const {
      fullName,
      phone,
      province,
      district,
      neighborhood,
      buildingType,
      projectStage,
      approximateArea,
      interestAreas,
      description,
    } = body;

    if (
      !fullName ||
      !phone ||
      !province ||
      !district ||
      !neighborhood ||
      !buildingType ||
      !projectStage
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "LÃ¼tfen zorunlu alanlarÄ± doldurun.",
        },
        { status: 400 }
      );
    }

    const projectRequest = await prisma.projectRequest.create({
      data: {
        fullName: String(fullName),
        phone: String(phone),

        province: String(province),
        district: String(district),
        neighborhood: String(neighborhood),

        buildingType: String(buildingType),
        projectStage: String(projectStage),

        approximateArea: approximateArea
          ? String(approximateArea)
          : null,

        interestAreas: Array.isArray(interestAreas)
          ? interestAreas.map(String).join(", ")
          : "",

        description: description
          ? String(description)
          : null,

        status: "YENI",
      },
    });

    console.log(
      "PROJECT REQUEST CREATED:",
      projectRequest
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Proje talebiniz baÅŸarÄ±yla oluÅŸturuldu.",
        id: projectRequest.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "PROJECT REQUEST PRISMA ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "VeritabanÄ±na kayÄ±t sÄ±rasÄ±nda hata oluÅŸtu.",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
