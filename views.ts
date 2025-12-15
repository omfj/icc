import { politiApi } from "./politi-api.ts";

type AvailableSlot = {
  place: string;
  placeId: string;
  dates: string[];
};

/**
 * Build the email body with available appointments
 * Fetches times for each date and formats them nicely
 */
export async function buildAvailabilityEmailBody(
  slots: AvailableSlot[]
): Promise<string> {
  const emailBodyParts = [];

  for (const slot of slots) {
    const dateLines = [];

    for (const date of slot.dates) {
      const times = await politiApi.getTimes(slot.placeId, date);
      const timesList = times.map((t) => t.time).join(", ");
      dateLines.push(`  - ${date} (${timesList})`);
    }

    emailBodyParts.push(`${slot.place}:\n${dateLines.join("\n")}`);
  }

  const emailBody = emailBodyParts.join("\n\n");

  return `Ledige timer for ID-kort funnet i løpet av neste uke:\n\n${emailBody}\n\nBestill nå på: https://pass-og-id.politiet.no/timebestilling/`;
}
