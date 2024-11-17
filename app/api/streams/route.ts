/* eslint-disable @typescript-eslint/ban-ts-comment */
import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { number, z } from "zod";
//@ts-expect-error
import youtubesearchapi from "youtube-search-api";

var YT_REGEX =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

const createStreamSchema = z.object({
  createrId: z.string(),
  url: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const data = createStreamSchema.parse(await req.json());
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
    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1
    );

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.createrId,
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
      message: "added stream",
      id: stream.id,
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
  const createrId = req.nextUrl.searchParams.get("createrId");
  const streams = await prismaClient.stream.findMany({
    where: {
      userId: createrId ?? "",
    },
  });
  return NextResponse.json({
    streams,
  });
}
