"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Lucide from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Appbar from "@/components/Appbar";
import { Card, CardContent } from "@/components/ui/card";
import { YT_REGEX } from "@/lib/util";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import YouTubePlayer from "youtube-player";

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

export default function StreamView({
  creatorId,
  playVideo = false,
}: {
  creatorId: string;
  playVideo: boolean;
}) {
  const [youtubeLink, setYoutubeLink] = useState("");

  const REFRESH_INTERNAL_MS = 10 * 1000;

  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [playNextLoader, setPlayNextLoader] = useState(false);
  const videoPlayerRef = useRef();

  async function refreshStreams() {
    const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
      credentials: "include",
    });
    const json = await res.json();
    setSongs(
      json.streams.sort((a: any, b: any) => (a.upvotes < b.upvotes ? 1 : -1))
    );
    setCurrentSong((songs) => {
      if (songs?.id === json.activeStream?.stream?.id) {
        return songs;
      }
      return json.activeStream.stream;
    });
  }

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/streams/", {
      method: "POST",
      body: JSON.stringify({
        creatorId: "76a6eac6-ed74-430e-857f-dd605af06623",
        url: youtubeLink,
      }),
    });
    setSongs([...songs, await res.json()]);
    setLoading(false);
    setYoutubeLink("");
  };

  useEffect(() => {
    refreshStreams();
    const interval = setInterval(() => {
      //  refreshStreams();
    }, REFRESH_INTERNAL_MS);
  }, []);

  const handleVote = (id: string, isUpvote: boolean) => {
    setSongs(
      songs
        .map((song) =>
          song.id === id
            ? {
                ...song,
                upvotes: isUpvote ? song.upvotes + 1 : song.upvotes - 1,
                haveUpvoted: !song.haveUpvoted,
              }
            : song
        )
        .sort((a, b) => b.upvotes - a.upvotes)
    );

    fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
      method: "POST",
      body: JSON.stringify({
        streamId: id,
      }),
    });
  };

  const playNext = async () => {
    if (songs.length > 0) {
      try {
        setPlayNextLoader(true);
        const data = await fetch("/api/streams/next", {
          method: "GET",
        });
        const json = await data.json();
        setCurrentSong(json.stream);
        setSongs((q) => q.filter((x) => x.id !== json.stream?.id));
      } catch (e) {}
      setPlayNextLoader(false);
    }
  };

  useEffect(() => {
    if (!videoPlayerRef.current) {
      return;
    }
    let player = YouTubePlayer(videoPlayerRef.current);

    // 'loadVideoById' is queued until the player is ready to receive API calls.
    player.loadVideoById(currentSong?.extractedId);

    // 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called.
    player.playVideo();

    function eventHandler(event: any) {
      if (event.data === 0) {
        playNext();
      }
    }
    player.on("stateChange", eventHandler);
    return () => {
      player.destroy();
    };
  }, [currentSong, videoPlayerRef]);

  const handleShare = async () => {
    const shareData = {
      title: "Check out my music queue!",
      text: "Join my music session and vote for your favorite songs!",
      url: `${window.location.hostname}/creator/${creatorId}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard",
          description: "Share this link with your fans!",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Error sharing",
        description: "There was an error sharing the link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-gray-50 dark:via-gray-100 dark:to-white relative transition-colors duration-300">
      <Appbar />
      <div className="container mx-auto p-4 pt-8 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white dark:text-gray-900">
            Song Voting Queue
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            <Lucide.Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Add to Queue Section */}
          <div className="rounded-lg bg-gray-900/60 p-4 space-y-2 dark:bg-white/60">
            <Input
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="Paste YouTube link here"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder:text-gray-500"
            />
            <Button
              disabled={loading}
              onSubmit={handleSubmit}
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              {loading ? "Loading..." : "Add to Queue"}
            </Button>
          </div>
        </form>
        {youtubeLink && youtubeLink.match(YT_REGEX) && !loading && (
          <Card className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder:text-gray-500">
            <CardContent className="p-4">
              <LiteYouTubeEmbed
                title=""
                id={youtubeLink.split("?v=")[1] ?? youtubeLink.split("?si")[2]}
              />
              {/* <p className="mt-2 text-center text-white placeholder:text-gray-400  dark:text-gray-900 dark:placeholder:text-gray-500">
                Video Preview
              </p> */}
            </CardContent>
          </Card>
        )}

        {/* Now Playing Section */}
        <div className="rounded-lg bg-gray-900/60 p-4 space-y-4 dark:bg-white/60">
          <h2 className="text-xl font-bold text-white dark:text-gray-900">
            Now Playing
          </h2>
          <Card
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 dark:bg-white
           dark:border-gray-300 dark:text-gray-900
            dark:placeholder:text-gray-500"
          >
            <CardContent className="p-4">
              {currentSong ? (
                <div>
                  {playVideo ? (
                    <>
                      <div ref={videoPlayerRef} className="w-full" />
                      {/* <iframe
                        width={"100%"}
                        height={300}
                        src={`https://www.youtube.com/embed/${currentSong.extractedId}?autoplay=1`}
                        allow="autoplay"
                      ></iframe> */}
                    </>
                  ) : (
                    <>
                      <img
                        src={currentSong.bigImg}
                        alt="video"
                        className="w-full h-72 object-cover rounded"
                      />
                      <p
                        className="mt-2 text-center font-semibold
                  text-white placeholder:text-gray-400  dark:text-gray-900 dark:placeholder:text-gray-500"
                      >
                        {currentSong.title}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400 dark:text-gray-600">
                  No video playing
                </p>
              )}
            </CardContent>
          </Card>
          {playVideo && (
            <Button
              disabled={playNextLoader}
              onClick={playNext}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              <Lucide.Play className="w-4 h-4 mr-2" />
              {playNextLoader ? "Loading..." : "Play Next"}
            </Button>
          )}
        </div>

        {/* Upcoming Songs Section */}
        <div className="rounded-lg bg-gray-900/60 p-4 space-y-4 dark:bg-white/60">
          <h2 className="text-xl font-bold text-white dark:text-gray-900">
            Upcoming Songs
          </h2>
          {songs.length === 0 && (
            <p className="text-center py-8 text-gray-400 dark:text-gray-600">
              No video in queue
            </p>
          )}
          {songs.map((song) => (
            <Card
              key={song.id}
              className="flex items-center gap-4 rounded-lg bg-gray-800/60 p-4 dark:bg-gray-200/60"
            >
              <CardContent className="flex p-4 items-center space-x-4">
                <img
                  src={song.smallImg}
                  alt={`Thumbnail for ${song.title}`}
                  className="w-20 h-20 rounded object-cover bg-gray-700"
                />
                <div className="flex-grow">
                  <h3 className="text-white dark:text-gray-900 font-medium">
                    {song.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleVote(song.id, song.haveUpvoted ? false : true)
                      }
                      className="flex items-center space-x-1 text-gray-300 hover:text-white hover:bg-gray-700 dark:text-gray-600 dark:hover:text-gray-900 dark:hover:bg-gray-200"
                    >
                      {song.haveUpvoted ? (
                        <Lucide.ThumbsDown className="h-4 w-4" />
                      ) : (
                        <Lucide.ThumbsUp className="h-4 w-4" />
                      )}
                      <span>{song.upvotes}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
