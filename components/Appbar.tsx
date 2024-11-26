"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import ToggleButton from "./ToggleButton";

export default function Appbar() {
  const session = useSession();
  return (
    <div className="container mx-auto flex items-center justify-between p-4">
      <Link href="/" className="text-2xl font-bold text-white dark:text-gray-900">
        Music UP
      </Link>
      <div className="flex items-center gap-4">
        <ToggleButton />
        {session.data?.user && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:border-purple-600 dark:bg-purple-600 dark:text-white dark:border-purple-500 dark:hover:bg-purple-700 dark:hover:border-purple-600"
          >
            Logout
          </Button>
        )}
        {!session.data?.user && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => signIn()}
            className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:border-purple-600 dark:bg-purple-600 dark:text-white dark:border-purple-500 dark:hover:bg-purple-700 dark:hover:border-purple-600"
          >
            Sign In
          </Button>
        )}
      </div>

      {/* <div className="flex justify-between">
        <div>Mselector</div>
        <div>
          {session.data?.user && (
            <button className="m-2 p-2 bg-red-400" onClick={() => signOut()}>
              Logout
            </button>
          )}
          {!session.data?.user && (
            <button className="m-2 p-2 bg-lime-500" onClick={() => signIn()}>
              Sign in
            </button>
          )} */}
      {/* </div>
      </div> */}
    </div>
  );
}
