import * as React from "react";
import { Loader2, LocateFixed, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  locateAndLabel,
  usePlaceSearch,
  useGeolocationAvailable,
  type Suggestion,
} from "@/lib/geocode";

export type PickedPlace = { label: string; lat: number; lng: number };

/**
 * Grab-style search-as-you-type location field backed by free OpenStreetMap
 * Nominatim results, biased to Yangon and debounced to respect the public
 * instance's ~1 req/s policy.
 */
export function LocationAutocomplete({
  id,
  value,
  onValueChange,
  onPick,
  onSuggestions,
  placeholder,
  showCurrentLocation = false,
}: {
  id: string;
  value: string;
  onValueChange: (text: string) => void;
  onPick: (place: PickedPlace) => void;
  onSuggestions?: (results: Suggestion[]) => void;
  placeholder?: string;
  showCurrentLocation?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const canLocate = useGeolocationAvailable();
  const [locateFailed, setLocateFailed] = React.useState(false);

  const { results, loading } = usePlaceSearch(value, typing);

  React.useEffect(() => {
    onSuggestions?.(results);
  }, [results, onSuggestions]);

  function choose(s: Suggestion) {
    onValueChange(s.primary);
    onPick({ label: s.primary, lat: s.lat, lng: s.lng });
    setTyping(false);
    setOpen(false);
  }

  async function locateNow() {
    setLocating(true);
    const found = await locateAndLabel();
    setLocating(false);
    if (!found) {
      setLocateFailed(true);
      return;
    }
    onValueChange(found.label);
    onPick(found);
    setTyping(false);
    setOpen(false);
  }

  const showLocateRow = showCurrentLocation && canLocate && !locateFailed;

  return (
    <div className={cn("relative", open ? "z-[1400]" : "z-[1200]")}>
      <Input
        id={id}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
          setTyping(true);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
      />
      {loading ? (
        <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : null}

      {open && (showLocateRow || results.length > 0 || (typing && value.trim().length >= 3)) ? (
        <ul
          className={cn(
            "absolute z-[1200] mt-1 w-full overflow-hidden rounded-xl border border-border",
            "bg-popover shadow-lg",
          )}
        >
          {showLocateRow ? (
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-primary hover:bg-muted"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void locateNow()}
              >
                {locating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LocateFixed className="size-4" />
                )}
                {locating ? "Finding you…" : "Use my current location"}
              </button>
            </li>
          ) : null}

          {results.map((s) => (
            <li key={s.id} className="border-t border-border first:border-t-0">
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-muted"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(s)}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{s.primary}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {s.secondary}
                  </span>
                </span>
              </button>
            </li>
          ))}

          {!loading && typing && value.trim().length >= 3 && results.length === 0 ? (
            <li className="border-t border-border px-3 py-2.5 text-xs text-muted-foreground">
              No places found in Yangon for “{value.trim()}”.
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
