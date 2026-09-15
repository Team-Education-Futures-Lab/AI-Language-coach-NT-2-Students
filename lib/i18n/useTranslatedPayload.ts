"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "./LocaleProvider";

type Options = {
  source?: string;
};

export function useTranslatedPayload<T>(payload: T, options: Options = {}) {
  const { locale } = useLocale();
  const [translated, setTranslated] = useState<T>(payload);

  const serialized = useMemo(() => JSON.stringify(payload), [payload]);

  useEffect(() => {
    let active = true;

    if (locale === "nl") {
      setTranslated(payload);
      return () => {
        active = false;
      };
    }

    setTranslated(payload);

    fetch(`/api/i18n?v=content-v1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        locale,
        payload,
        source: options.source ?? "auto",
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (!active) return;
        if (!json || json.ok !== true || !("payload" in json)) return;
        setTranslated(json.payload as T);
      })
      .catch(() => {
        if (!active) return;
        setTranslated(payload);
      });

    return () => {
      active = false;
    };
  }, [locale, options.source, serialized]);

  return translated;
}
