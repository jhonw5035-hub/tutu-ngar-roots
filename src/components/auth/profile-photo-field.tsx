import * as React from "react";
import { Camera } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Optional profile photo for signup.
 *
 * Privacy: this photo exists ONLY so the driver can recognise the passenger at
 * pickup. It must NEVER be surfaced in the passenger group preview screen,
 * which intentionally shows first name + gender icon only. Do not wire this
 * value into any passenger-visible list.
 *
 * TODO(supabase): replace the base64 preview with an upload to Supabase
 * Storage (private bucket, signed URL for the assigned driver only) and store
 * the returned object path instead of the data URL.
 */
export function ProfilePhotoField({
  value,
  onChange,
  name,
}: {
  value?: string | undefined;
  onChange: (dataUrl: string | undefined) => void;
  name?: string | undefined;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const initials =
    (name ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TT";

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === "string" ? reader.result : undefined);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={value ? "Change profile photo" : "Add profile photo"}
        className={cn(
          "relative size-16 shrink-0 overflow-hidden rounded-full border border-border",
          "bg-primary/10 text-primary transition-transform active:scale-95",
        )}
      >
        {value ? (
          <img src={value} alt="Your profile photo preview" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center bg-primary text-lg font-bold text-primary-foreground">
            {initials}
          </span>
        )}
        <span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-card bg-secondary text-secondary-foreground">
          <Camera className="size-3" />
        </span>
      </button>

      <div className="min-w-0">
        <p className="text-sm font-medium">Profile photo (optional)</p>
        <p className="text-xs text-muted-foreground">Helps your driver recognize you at pickup.</p>
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="mt-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            Remove photo
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  );
}
