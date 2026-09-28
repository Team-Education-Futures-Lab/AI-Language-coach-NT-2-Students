"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "./LocaleProvider";

type Options = {
  source?: string;
};

const translatedPayloadCache = new Map<string, unknown>();
const pendingTranslations = new Map<string, Promise<unknown>>();

export function useTranslatedPayload<T>(payload: T, options: Options = {}) {
  const { beginTranslation, endTranslation, locale } = useLocale();
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

    const source = options.source ?? "auto";
    const cacheKey = `${locale}:${source}:${serialized}`;
    const cached = translatedPayloadCache.get(cacheKey);
    if (cached !== undefined) {
      setTranslated(cached as T);
      return () => {
        active = false;
      };
    }

    let request = pendingTranslations.get(cacheKey);
    if (!request) {
      beginTranslation();
      request = fetch(`/api/i18n?v=content-v1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          locale,
          payload,
          source,
        }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (!json || json.ok !== true || !("payload" in json)) {
            return payload;
          }
          translatedPayloadCache.set(cacheKey, json.payload);
          return json.payload;
        })
        .finally(() => {
          pendingTranslations.delete(cacheKey);
          endTranslation();
        });
      pendingTranslations.set(cacheKey, request);
    }

    request
      .then((json) => {
        if (!active) return;
        setTranslated(json as T);
      })
      .catch(() => {
        if (!active) return;
        setTranslated(payload);
      });

    return () => {
      active = false;
    };
  }, [beginTranslation, endTranslation, locale, options.source, serialized]);

  return translated;
}
