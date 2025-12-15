import { politiApi } from "./politi-api.ts";
import { emailService } from "./email.ts";

const places = [
  {
    id: "a7d1ce445762e13d9634fe8263262fd2faf362877741916a67ee82e26abd121b",
    name: "Trondheim",
    enabled: true,
  },
  {
    id: "a5cb8090ab3cadc95b8e94fc2f90c7700e391b9fc0d2a1a31cbd54157d86eff1",
    name: "Heimdal",
    enabled: true,
  },
  {
    id: "d7b7dfe29e507f78dff90f35d540095f4d4eea1a78be9b1299b375e7ca30f227",
    name: "Bergen Vest",
    enabled: false,
  },
  {
    id: "899cf7b06941d67e79601fe02f9274bf66018118efed29ed0d3c98dd853a5cb2",
    name: "Oppdal",
    enabled: true,
  },
];

function isWithinNextWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return date >= now && date <= oneWeekFromNow;
}

console.log(
  `[${new Date().toISOString()}] Running ID card availability check...`
);

const availableSlots: { place: string; dates: string[] }[] = [];

for (const place of places.filter((p) => p.enabled)) {
  const data = await politiApi.getDates(place.id);

  // Filter dates that are within the next week and have available times
  const upcomingDates = data
    .filter((d) => isWithinNextWeek(d.date))
    .map((d) => d.date);

  if (upcomingDates.length > 0) {
    availableSlots.push({
      place: place.name,
      dates: upcomingDates,
    });
  }
}

// Send email if any available slots were found
if (availableSlots.length > 0) {
  const emailBody = availableSlots
    .map((slot) => {
      const dateList = slot.dates.map((d) => `  - ${d}`).join("\n");
      return `${slot.place}:\n${dateList}`;
    })
    .join("\n\n");

  console.log("📧 Ledige timer funnet! Sender e-post...");

  try {
    await emailService.sendEmail({
      subject: "🎉 Ledig time for ID-kort!",
      body: `Ledige timer for ID-kort funnet i løpet av neste uke:\n\n${emailBody}\n\nBestill nå på: https://pass-og-id.politiet.no/timebestilling/`,
    });
  } catch (error) {
    console.error("Kunne ikke sende e-post:", error);
  }
} else {
  console.log("Ingen ledige timer funnet i løpet av neste uke.");
}

console.log("Check completed!");
