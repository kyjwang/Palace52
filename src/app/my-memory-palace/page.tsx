import { MyMemoryPalaceClient } from "@/components/app/my-memory-palace-client";
import { getCurrentUser } from "@/lib/auth";

export default async function MyMemoryPalacePage() {
  const user = await getCurrentUser();

  return (
    <MyMemoryPalaceClient
      headerUser={
        user
          ? {
              username: user.username,
              displayName: user.profile?.displayName,
              avatarColor: user.profile?.avatarColor
            }
          : null
      }
    />
  );
}
