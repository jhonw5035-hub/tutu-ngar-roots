import { Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Compact EN | မြန်မာ switcher, sized to match the other header icons. */
export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="touchIcon"
          aria-label={t("language")}
          className="relative gap-1 px-2"
        >
          <Globe className="size-4" />
          <span className="text-[11px] font-semibold uppercase">
            {lang === "en" ? "EN" : "MY"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuItem
          onSelect={() => setLang("en")}
          className={cn(lang === "en" && "font-semibold text-primary")}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setLang("my")}
          className={cn(lang === "my" && "font-semibold text-primary")}
        >
          မြန်မာ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
