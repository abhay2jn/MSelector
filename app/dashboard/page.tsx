import StreamView from "@/components/StreamView";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) redirect("/");

  return <StreamView creatorId={session.user.id} playVideo={true} />;
}

export const dynamic = "auto";
