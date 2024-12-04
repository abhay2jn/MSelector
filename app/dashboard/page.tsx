"use client";

import React from "react";
import StreamView from "@/components/StreamView";

interface Song {
  id: string;
  type: string;
  url: string;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  active: boolean;
  userId: string;
  upvotes: number;
  haveUpvoted: boolean;
}

const REFRESH_INTERNAL_MS = 10 * 1000;

const creatorId = "76a6eac6-ed74-430e-857f-dd605af06623";

export default function Dashboard() {
  return <StreamView creatorId={creatorId} playVideo={true} />;
}
