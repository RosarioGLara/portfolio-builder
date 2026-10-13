import { headers } from "next/headers";
import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  // 1. Verify the user's session.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json(
      { error: "You must sign in first." },
      { status: 401 }
    );
  }

  // 2. Read and validate the request body.
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("slug" in body) ||
    !("config" in body)
  ) {
    return Response.json(
      { error: "A slug and portfolio configuration are required." },
      { status: 400 }
    );
  }

  const { slug, config } = body;

  if (
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    slug.length > 80
  ) {
    return Response.json(
      { error: "Use a valid lowercase URL slug." },
      { status: 400 }
    );
  }

  if (
    typeof config !== "object" ||
    config === null ||
    Array.isArray(config)
  ) {
    return Response.json(
      { error: "Portfolio configuration must be an object." },
      { status: 400 }
    );
  }

  // 3. Save the portfolio under the authenticated user.
  try {
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: session.user.id,
        slug,
        config: config as Prisma.InputJsonValue,
        isPublished: false,
      },
      select: {
        id: true,
        slug: true,
        isPublished: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        message: "Portfolio saved successfully.",
        portfolio,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "That portfolio URL is already in use." },
        { status: 409 }
      );
    }

    console.error("Failed to save portfolio:", error);

    return Response.json(
      { error: "Unable to save the portfolio." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  // 1. Verify the signed-in user.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json(
      { error: "You must sign in first." },
      { status: 401 }
    );
  }

  // 2. Parse the request body.
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("id" in body) ||
    typeof body.id !== "string" ||
    body.id.trim() === ""
  ) {
    return Response.json(
      { error: "A valid portfolio ID is required." },
      { status: 400 }
    );
  }

  const id = body.id;
  const updateData: Prisma.PortfolioUpdateInput = {};

  // 3. Validate the configuration, if supplied.
  if ("config" in body) {
    if (
      typeof body.config !== "object" ||
      body.config === null ||
      Array.isArray(body.config)
    ) {
      return Response.json(
        { error: "Portfolio configuration must be an object." },
        { status: 400 }
      );
    }

    updateData.config = body.config as Prisma.InputJsonValue;
  }

  // 4. Validate the custom URL slug, if supplied.
  if ("slug" in body) {
    if (
      typeof body.slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug) ||
      body.slug.length > 80
    ) {
      return Response.json(
        { error: "Invalid portfolio slug." },
        { status: 400 }
      );
    }

    updateData.slug = body.slug;
  }

  // 5. Validate publishing status, if supplied.
  if ("isPublished" in body) {
    if (typeof body.isPublished !== "boolean") {
      return Response.json(
        { error: "Publishing status must be true or false." },
        { status: 400 }
      );
    }

    updateData.isPublished = body.isPublished;
  }

  // Require at least one field to update.
  if (Object.keys(updateData).length === 0) {
    return Response.json(
      { error: "No valid portfolio updates were provided." },
      { status: 400 }
    );
  }

  try {
    // 6. Find the portfolio only if this user owns it.
    const existing = await prisma.portfolio.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!existing) {
      return Response.json(
        { error: "Portfolio not found." },
        { status: 404 }
      );
    }

    // 7. Apply only the requested updates.
    const portfolio = await prisma.portfolio.update({
      where: { id: existing.id },
      data: updateData,
      select: {
        id: true,
        slug: true,
        isPublished: true,
        updatedAt: true,
      },
    });

    return Response.json({
      message: "Portfolio updated successfully.",
      portfolio,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "That portfolio URL is already in use." },
        { status: 409 }
      );
    }

    console.error("Failed to update portfolio:", error);

    return Response.json(
      { error: "Unable to update the portfolio." },
      { status: 500 }
    );
  }
}

export async function GET() {
  // 1. Verify the signed-in user.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json(
      { error: "You must sign in first." },
      { status: 401 }
    );
  }

  try {
    // 2. Retrieve only portfolios owned by this user.
    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        slug: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        config: true,
      },
    });

    return Response.json({ portfolios });
  } catch (error) {
    console.error("Failed to retrieve portfolios:", error);

    return Response.json(
      { error: "Unable to retrieve portfolios." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json(
      { error: "You must sign in first." },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("id" in body) ||
    typeof body.id !== "string" ||
    body.id.trim() === ""
  ) {
    return Response.json(
      { error: "A valid portfolio ID is required." },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.portfolio.deleteMany({
      where: {
        id: body.id,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return Response.json(
        { error: "Portfolio not found." },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Portfolio deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete portfolio:", error);

    return Response.json(
      { error: "Unable to delete the portfolio." },
      { status: 500 }
    );
  }
}
