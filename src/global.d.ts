/// <reference types="@sveltejs/kit" />

declare namespace App {
  interface Locals {
    contentType: string;
    userId: number;
    theme: Theme;
    defaultDarkMode: boolean;
    timezone: string;
    trackableView?: string;
    referrer: string | null;
    /** Used to return data from endpoints back to the page */
    returnValue: Record<string, unknown>;
    /** Used to override the default redirect target when redirecting a non-JS
     * form submission */
    redirectTarget?: string;
  }

  interface Platform {}

  interface Session {
    theme: Theme;
    defaultDarkMode: boolean;
    randomColor: string;
    timezone: string;
    trackableView?: string;
    returnValue: Record<string, unknown>;
  }

  interface Stuff {}
}
