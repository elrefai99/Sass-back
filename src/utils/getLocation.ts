import type { Request } from "express";

export const getLocation = (req: Request): string => {
     const header = (name: string): string | undefined => {
          const value = req.headers[name];
          return Array.isArray(value) ? value[0] : value;
     };

     const city = header("cf-ipcity");
     const region = header("cf-region");
     const countryCode = header("cf-ipcountry");

     let country: string | undefined = countryCode;
     if (countryCode && countryCode !== "XX" && countryCode !== "T1") {
          try {
               const names = new Intl.DisplayNames(["en"], { type: "region" });
               country = names.of(countryCode) ?? countryCode;
          } catch {
               country = countryCode;
          }
     }

     const parts = [city, region, country].filter(Boolean);
     return parts.length ? parts.join(", ") : "Unknown";
};
