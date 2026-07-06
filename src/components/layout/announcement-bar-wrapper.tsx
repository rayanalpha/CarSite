import { getSettings } from "@/lib/settings";
import { AnnouncementBar } from "./announcement-bar";

export async function AnnouncementBarWrapper() {
  const settings = await getSettings();

  if (!settings.announcementEnabled || !settings.announcementText) return null;

  const now = Date.now();

  if (settings.announcementStart && new Date(settings.announcementStart).getTime() > now) return null;
  if (settings.announcementEnd && new Date(settings.announcementEnd).getTime() < now) return null;

  return <AnnouncementBar text={settings.announcementText} />;
}
