"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { generateSlug } from "./utils";

// Shared schema
const leagueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  showIntro: z.boolean(),
  introContent: z.string().optional().nullable(),
  isPrivate: z.boolean(),
  hasPaidTier: z.boolean(),
  unlockMode: z.enum(["LEVELS", "TIMED", "FREE"]),
  timedUnlockInterval: z
    .enum(["DAILY", "WEEKLY", "CUSTOM"])
    .optional()
    .nullable(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

const validateFormData = (
  formData: FormData
):
  | {
      success: true;
      data: z.infer<typeof leagueSchema>;
    }
  | {
      success: false;
      error: string;
    } => {
  const data = {
    name: formData.get("name"),
    description: formData.get("description"),
    showIntro: formData.get("showIntro") === "true",
    introContent: formData.get("introContent"),
    isPrivate: formData.get("isPrivate") === "true",
    hasPaidTier: formData.get("hasPaidTier") === "true",
    unlockMode: formData.get("unlockMode"),
    timedUnlockInterval: formData.get("timedUnlockInterval"),
    startDate: formData.get("startDate"),
  };

  const validated = leagueSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: `Invalid request: ${validated.error.errors
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ")}`,
    };
  }

  return { success: true, data: validated.data };
};

// Database operations
async function prismaCreateLeague(
  data: z.infer<typeof leagueSchema>,
  creatorId: string
) {
  return prisma.league.create({
    data: {
      ...data,
      creatorId,
      slug: generateSlug(),
    },
  });
}

async function prismaUpdateLeague(
  slug: string,
  data: z.infer<typeof leagueSchema>
) {
  return prisma.league.update({
    where: { slug },
    data,
  });
}

async function prismaGetLeague(slug: string) {
  return prisma.league.findUnique({
    where: { slug },
    select: { creatorId: true },
  });
}

// Add this Prisma operation with the other prisma functions
async function prismaDeleteLeague(slug: string) {
  return prisma.league.delete({
    where: { slug },
  });
}

// Action handlers
export async function createLeague(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }

  const validated = validateFormData(formData);
  if (!validated.success) {
    return { message: validated.error };
  }

  try {
    const league = await prismaCreateLeague(validated.data, session.user.id);
    revalidatePath("/leagues");
    return { message: `Created league ${league.id}`, slug: league.slug };
  } catch (error) {
    return { message: "Failed to create league" };
  }
}

export async function updateLeague(slug: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { message: "Unauthorized" };
  }

  const validated = validateFormData(formData);
  if (!validated.success) {
    return { message: validated.error };
  }

  try {
    const league = await prismaGetLeague(slug);
    if (!league) {
      return { message: "League not found" };
    }

    if (league.creatorId !== session.user.id) {
      return { message: "Unauthorized to update this league" };
    }

    const updatedLeague = await prismaUpdateLeague(slug, validated.data);
    revalidatePath(`/league/${slug}/settings`);
    return { message: "League updated successfully", slug: updatedLeague.slug };
  } catch (error) {
    if (error instanceof Error) {
      return { message: `Failed to update league: ${error.message}` };
    }
    return { message: "Failed to update league" };
  }
}

export async function deleteLeague(slug: string) {
  const session = await auth();
  if (!session?.user) {
    return { message: "Unauthorized" };
  }

  try {
    const league = await prismaGetLeague(slug);
    if (!league) {
      return { message: "League not found" };
    }

    if (league.creatorId !== session.user.id) {
      return { message: "Unauthorized to delete this league" };
    }

    await prismaDeleteLeague(slug);
    revalidatePath("/leagues");
    return { message: "League deleted successfully" };
  } catch (error) {
    return { message: "Failed to delete league" };
  }
}
