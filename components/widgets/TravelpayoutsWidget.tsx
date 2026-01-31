"use client";

import { useEffect } from "react";

export default function GYGWidget({ destination }: { destination: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://widget.getyourguide.com/dist/pa.umd.production.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div data-gyg-widget="activities" data-gyg-q={destination} />;
}
