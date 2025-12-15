import { assertEquals, assertStringIncludes } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { buildAvailabilityEmailBody } from "./views.ts";
import { politiApi } from "./politi-api.ts";
import type { TimeSlot } from "./politi-api.ts";

const originalGetTimes = politiApi.getTimes.bind(politiApi);

function mockGetTimes(mockData: Record<string, TimeSlot[]>) {
  // deno-lint-ignore require-await
  politiApi.getTimes = async (branchId: string, date: string) => {
    const key = `${branchId}:${date}`;
    return mockData[key] || [];
  };
}

describe("buildAvailabilityEmailBody", () => {
  afterEach(() => {
    politiApi.getTimes = originalGetTimes;
  });

  it("should format single place with one date", async () => {
    mockGetTimes({
      "place1:2025-12-20": [
        { date: "2025-12-20", time: "09:00" },
        { date: "2025-12-20", time: "10:00" },
        { date: "2025-12-20", time: "11:00" },
      ],
    });

    const slots = [
      {
        place: "Trondheim",
        placeId: "place1",
        dates: ["2025-12-20"],
      },
    ];

    const result = await buildAvailabilityEmailBody(slots);

    assertStringIncludes(result, "Ledige timer for ID-kort funnet");
    assertStringIncludes(result, "Trondheim:");
    assertStringIncludes(result, "2025-12-20 (09:00, 10:00, 11:00)");
  });

  it("should format single place with multiple dates", async () => {
    mockGetTimes({
      "place1:2025-12-20": [
        { date: "2025-12-20", time: "09:00" },
        { date: "2025-12-20", time: "10:00" },
      ],
      "place1:2025-12-21": [
        { date: "2025-12-21", time: "14:00" },
        { date: "2025-12-21", time: "15:00" },
      ],
    });

    const slots = [
      {
        place: "Trondheim",
        placeId: "place1",
        dates: ["2025-12-20", "2025-12-21"],
      },
    ];

    const result = await buildAvailabilityEmailBody(slots);

    assertStringIncludes(result, "Trondheim:");
    assertStringIncludes(result, "2025-12-20 (09:00, 10:00)");
    assertStringIncludes(result, "2025-12-21 (14:00, 15:00)");
  });

  it("should format multiple places", async () => {
    mockGetTimes({
      "place1:2025-12-20": [{ date: "2025-12-20", time: "09:00" }],
      "place2:2025-12-22": [
        { date: "2025-12-22", time: "11:00" },
        { date: "2025-12-22", time: "12:00" },
      ],
    });

    const slots = [
      {
        place: "Trondheim",
        placeId: "place1",
        dates: ["2025-12-20"],
      },
      {
        place: "Heimdal",
        placeId: "place2",
        dates: ["2025-12-22"],
      },
    ];

    const result = await buildAvailabilityEmailBody(slots);

    assertStringIncludes(result, "Trondheim:");
    assertStringIncludes(result, "2025-12-20 (09:00)");
    assertStringIncludes(result, "Heimdal:");
    assertStringIncludes(result, "2025-12-22 (11:00, 12:00)");
  });

  it("should handle empty slots array", async () => {
    const slots: {
      place: string;
      placeId: string;
      dates: string[];
    }[] = [];

    const result = await buildAvailabilityEmailBody(slots);

    assertStringIncludes(result, "Ledige timer for ID-kort funnet");
    assertStringIncludes(
      result,
      "https://pass-og-id.politiet.no/timebestilling/"
    );

    // Should only contain the header and footer, no place information
    const lines = result.split("\n").filter((l) => l.trim() !== "");
    assertEquals(lines.length, 2); // Only header and footer line
  });

  it("should have proper formatting", async () => {
    mockGetTimes({
      "place1:2025-12-20": [{ date: "2025-12-20", time: "09:00" }],
    });

    const slots = [
      {
        place: "Trondheim",
        placeId: "place1",
        dates: ["2025-12-20"],
      },
    ];

    const result = await buildAvailabilityEmailBody(slots);

    const expectedStructure = [
      "Ledige timer for ID-kort funnet i løpet av neste uke:",
      "",
      "Trondheim:",
      "  - 2025-12-20 (09:00)",
      "",
      "Bestill nå på: https://pass-og-id.politiet.no/timebestilling/",
    ];

    assertEquals(result, expectedStructure.join("\n"));
  });
});
