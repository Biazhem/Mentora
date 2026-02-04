import { createClient } from "@supabase/supabase-js";
import { auth, clerkClient } from "@clerk/nextjs/server";

async function getToken() {
  const { sessionId } = auth();

  if (!sessionId) return null;

  const template = "test";
  const client = clerkClient();
  const token = await client.sessions.getToken(sessionId, template);

  return token;
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      accessToken: async () => {
        const token = await getToken();
        console.log(token);
        return token ?? undefined;
      },
    },
  }
);
