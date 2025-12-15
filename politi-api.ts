const BASE_URL =
  "https://pass-og-id.politiet.no/qmaticwebbooking/rest/schedule/branches/";

const SERVICE_PUBLIC_ID =
  "8e859bd4c1752249665bf2363ea231e1678dbb7fc4decff862d9d41975a9a95a"; // ID-card

export type DateAvailability = {
  date: string;
};

export type TimeSlot = {
  date: string;
  time: string;
};

export type Branch = {
  id: string;
  name: string;
};

export class PolitiApiClient {
  private baseUrl: string;
  private servicePublicId: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = BASE_URL;
    this.servicePublicId = SERVICE_PUBLIC_ID;
    this.defaultHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0",
      Accept: "application/json, text/plain, */*",
    };
  }

  private getRequestOptions(): RequestInit {
    return {
      headers: this.defaultHeaders,
      credentials: "include",
      referrer: "https://pass-og-id.politiet.no/timebestilling/index.html",
      method: "GET",
      mode: "cors",
    };
  }

  /**
   * Get available dates for a specific branch/location
   * @param branchId - The branch ID to check
   * @returns Array of available dates
   */
  async getDates(branchId: string): Promise<DateAvailability[]> {
    const url = `${this.baseUrl}${branchId}/dates;servicePublicId=${this.servicePublicId};customSlotLength=10`;

    const response = await fetch(url, this.getRequestOptions());

    if (!response.ok) {
      throw new Error(
        `Failed to fetch dates: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  /**
   * Get available time slots for a specific date and branch
   * @param branchId - The branch ID
   * @param date - The date to check (YYYY-MM-DD format)
   * @returns Array of time slots
   */
  async getTimes(branchId: string, date: string): Promise<TimeSlot[]> {
    const url = `${this.baseUrl}${branchId}/dates/${date}/times;servicePublicId=${this.servicePublicId};customSlotLength=10`;

    const response = await fetch(url, this.getRequestOptions());

    if (!response.ok) {
      throw new Error(
        `Failed to fetch times: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  /**
   * Check if there are any available dates within a time range
   * @param branchId - The branch ID to check
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @returns Filtered array of available dates within range
   */
  async getAvailableDatesInRange(
    branchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DateAvailability[]> {
    const dates = await this.getDates(branchId);

    return dates.filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });
  }
}

// Export singleton instance
export const politiApi = new PolitiApiClient();
