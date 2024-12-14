/* eslint-disable @typescript-eslint/ban-ts-comment */
import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
//@ts-expect-error
import youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/lib/util";
import { getServerSession } from "next-auth";

const createStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

const MAX_QUEUE_LENGTH = 20;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const user = await prismaClient.user.findFirst({
      where: {
        email: session?.user?.email ?? "",
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthenticated",
        },
        {
          status: 403,
        }
      );
    }

    const data = createStreamSchema.parse(await req.json());

    if (!data.url.trim()) {
      return NextResponse.json(
        {
          message: "YouTube link cannot be empty",
        },
        {
          status: 400,
        }
      );
    }

    const isYt = data.url.match(YT_REGEX);
    if (!isYt) {
      return NextResponse.json(
        {
          message: "Wrong url format",
        },
        {
          status: 404,
        }
      );
    }
    const extractedId = data.url.split("?v=")[1];

    const res = await youtubesearchapi.GetVideoDetails(extractedId);

    // Check if the user is not the creator
    if (user.id !== data.creatorId) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const userRecentStreams = await prismaClient.stream.count({
        where: {
          userId: data.creatorId,
          addedBy: user.id,
          createAt: {
            gte: tenMinutesAgo,
          },
        },
      });
      // Check for duplicate song in the last 10 minutes
      const duplicateSong = await prismaClient.stream.findFirst({
        where: {
          userId: data.creatorId,
          extractedId: extractedId,
          createAt: {
            gte: tenMinutesAgo,
          },
        },
      });
      if (duplicateSong) {
        return NextResponse.json(
          {
            message: "This song was already added in the last 10 minutes",
          },
          {
            status: 429,
          }
        );
      }
      // Rate limiting checks for non-creator users
      const streamsLastTwoMinutes = await prismaClient.stream.count({
        where: {
          userId: data.creatorId,
          addedBy: user.id,
          createAt: {
            gte: twoMinutesAgo,
          },
        },
      });
      if (streamsLastTwoMinutes >= 2) {
        return NextResponse.json(
          {
            message:
              "Rate limit exceeded: You can only add 2 songs per 2 minutes",
          },
          {
            status: 429,
          }
        );
      }
      if (userRecentStreams >= 5) {
        return NextResponse.json(
          {
            message:
              "Rate limit exceeded: You can only add 5 songs per 10 minutes",
          },
          {
            status: 429,
          }
        );
      }
    }

    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1
    );

    const existingActiveStream = await prismaClient.stream.count({
      where: {
        userId: data.creatorId,
        played: false,
      },
    });

    if (existingActiveStream >= MAX_QUEUE_LENGTH) {
      return NextResponse.json(
        {
          message: "Maximum limit reached",
        },
        {
          status: 404,
        }
      );
    }

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        addedBy: user.id,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: res.title ?? "Can't find title",
        smallImg:
          (thumbnails.length > 1
            ? thumbnails[thumbnails.length - 2].url
            : thumbnails[thumbnails.length - 1].url) ??
          "https://media.istockphoto.com/id/1322123064/photo/portrait-of-an-adorable-white-cat-in-sunglasses-and-an-shirt-lies-on-a-fabric-hammock.jpg?s=612x612&w=0&k=20&c=-G6l2c4jNI0y4cenh-t3qxvIQzVCOqOYZNvrRA7ZU5o=",
        bigImg:
          thumbnails[thumbnails.length - 1].url ??
          "https://media.istockphoto.com/id/1293763250/photo/cute-kitten-licking-glass-table-with-copy-space.jpg?s=612x612&w=0&k=20&c=JbHxMGlHpB3BwgQChCDLt-Iwbl2MYX-SS_f8oQa8RO0=",
      },
    });
    return NextResponse.json({
      ...stream,
      haveUpvoted: false,
      upvotes: 0,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.log(e);

    return NextResponse.json(
      {
        message: "Error while adding a stream",
      },
      {
        status: 404,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });
  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 401,
      }
    );
  }

  const creatorId = req.nextUrl.searchParams.get("creatorId");
  if (!creatorId) {
    return NextResponse.json(
      {
        message: "CreatorId not found",
      },
      {
        status: 401,
      }
    );
  }
  const [streams, activeStream] = await Promise.all([
    prismaClient.stream.findMany({
      where: {
        userId: creatorId,
        played: false,
      },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        upvotes: {
          where: {
            userId: user.id,
          },
        },
      },
    }),
    prismaClient.currentStream.findFirst({
      where: {
        userId: creatorId,
      },
      include: {
        stream: true,
      },
    }),
  ]);

  const isCreator = user.id === creatorId;

  return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvotes,
      haveUpvoted: rest.upvotes.length ? true : false,
    })),
    activeStream,
    creatorId,
    isCreator,
  });
}
