import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "vi", labelKey: "language.vi", short: "VI" },
  { code: "en", labelKey: "language.en", short: "EN" },
] as const;

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = LANGUAGES.find(({ code }) => code === i18n.language) ?? LANGUAGES[0];

  const handleChange = (language: string) => {
    void i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          aria-label={t("language.label")}
          className='group relative w-[60px] h-[60px] flex justify-center items-center cursor-pointer hover:scale-[0.98] transition-all active:scale-[1.0] outline-none'
        >
          <img
            src='/Buttons/SmallButton-pressed.png'
            alt=''
            className='absolute inset-0 w-full h-full drop-shadow-[0_0_0.15rem_rgba(124,6,226,0.45)] group-hover:drop-shadow-[0_0_0.25rem_rgba(124,6,226,0.75)] transition-all'
          />
          <Languages className='relative z-10 w-[26px] h-[26px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' strokeWidth={2.5} />
          <span className='absolute -bottom-1 right-0 z-10 min-w-[22px] px-1 h-[18px] rounded-sm bg-[#439887] border border-white font-titan text-[11px] text-[#fff8e7] leading-[16px] text-center shadow-sm'>
            {currentLanguage.short}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={8}
        className='w-56 p-2 border-2 border-white/40 bg-[#23ae89d1] shadow-[0_0_12px_rgba(124,6,226,0.35)] rounded-lg'
      >
        <p className='font-titan text-white text-center text-lg mb-2 drop-shadow-sm'>{t("language.label")}</p>
        <div className='flex flex-col gap-1'>
          {LANGUAGES.map(({ code, labelKey, short }) => {
            const isActive = i18n.language === code;

            return (
              <button
                key={code}
                type='button'
                onClick={() => handleChange(code)}
                className={cn(
                  "w-full font-titan text-gray-600 bg-[#d9d9d9b8] hover:bg-[#d9d9d9] transition-all p-2 rounded-md flex items-center gap-2 outline-none active:scale-[0.99]",
                  isActive && "ring-2 ring-white/80 bg-[#fdfdfd] text-[#439887] shadow-[0_0_8px_rgba(124,6,226,0.35)]"
                )}
              >
                <span className='w-[28px] h-[28px] rounded-md bg-[#439887] text-white text-xs font-titan flex items-center justify-center shrink-0'>
                  {short}
                </span>
                <span>{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSwitcher;
