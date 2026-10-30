import type { JSX, ReactNode } from "react";

export type TabIconProps = { active?: boolean; className?: string };

function TabSvg({ active, className, children }: TabIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill={active ? "currentColor" : "none"}
      stroke={active ? "none" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

export function HomeIcon({ active = false, className }: TabIconProps): JSX.Element {
  return (
    <TabSvg active={active} className={className}>
      {active ? (
        <path
          fillRule="evenodd"
          d="M11.1 3.4a1.5 1.5 0 0 1 1.8 0l6.9 5.2c.4.3.7.8.7 1.3V19a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9.1c0-.5.3-1 .7-1.3l6.9-5.2ZM9.9 21v-3.4a2.1 2.1 0 0 1 4.2 0V21H9.9Zm1.5-6.8v-2.2h1.2v2.2h-1.2Zm1.2-2.2c0-1.9 1.2-3 3.2-3 0 1.9-1.2 3-3.2 3Zm-1.2 0c0-1.9-1.2-3-3.2-3 0 1.9 1.2 3 3.2 3Z"
        />
      ) : (
        <>
          <path d="M4.5 10.3 12 4.6l7.5 5.7V19a1.6 1.6 0 0 1-1.6 1.6H6.1A1.6 1.6 0 0 1 4.5 19v-8.7Z" />
          <path d="M9.9 20.6v-3.3a2.1 2.1 0 0 1 4.2 0v3.3" />
          <path d="M12 14v-2.2" strokeWidth={1.6} />
          <path d="M12 11.8c0-1.8 1.2-2.8 3-2.8 0 1.8-1.2 2.8-3 2.8Zm0 0c0-1.8-1.2-2.8-3-2.8 0 1.8 1.2 2.8 3 2.8Z" strokeWidth={1.5} />
        </>
      )}
    </TabSvg>
  );
}

export function GamesIcon({ active = false, className }: TabIconProps): JSX.Element {
  return (
    <TabSvg active={active} className={className}>
      {active ? (
        <>
          <path d="M11 3c.4 5 3.2 7.9 8 8.3-4.8.4-7.6 3.3-8 8.3-.4-5-3.2-7.9-8-8.3 4.8-.4 7.6-3.3 8-8.3Z" />
          <circle cx="19" cy="19" r="2.5" />
        </>
      ) : (
        <>
          <path d="M11 3.8c.5 4.4 3.1 7 7.5 7.5-4.4.5-7 3.1-7.5 7.5-.5-4.4-3.1-7-7.5-7.5 4.4-.5 7-3.1 7.5-7.5Z" />
          <circle cx="19" cy="19" r="2" />
        </>
      )}
    </TabSvg>
  );
}

export function GardenIcon({ active = false, className }: TabIconProps): JSX.Element {
  return (
    <TabSvg active={active} className={className}>
      {active ? (
        <>
          <path d="M6.1 14.6h11.8l-.9 4.9a1.9 1.9 0 0 1-1.9 1.6H8.9A1.9 1.9 0 0 1 7 19.5l-.9-4.9Z" />
          <rect x="5" y="11.7" width="14" height="2.1" rx="1.05" />
          <path d="M12.9 10.3c.2-3.4 2.2-5.4 6-5.4-.2 3.4-2.2 5.4-6 5.4Z" />
          <path d="M11.1 12c-3.8 0-5.8-2-6-5.4 3.8 0 5.8 2 6 5.4Z" />
          <path d="M12 12.6V8.6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M6.1 14.6h11.8l-.9 4.9a1.9 1.9 0 0 1-1.9 1.6H8.9A1.9 1.9 0 0 1 7 19.5l-.9-4.9Z" />
          <path d="M5.4 12.7h13.2" />
          <path d="M12 14.6V8.3" />
          <path d="M12.4 9.5c.2-3.1 2.1-4.9 5.4-4.9-.2 3.1-2.1 4.9-5.4 4.9Z" strokeWidth={1.6} />
          <path d="M11.6 11.3c-3.3 0-5.2-1.8-5.4-4.9 3.3 0 5.2 1.8 5.4 4.9Z" strokeWidth={1.6} />
        </>
      )}
    </TabSvg>
  );
}

export function MemoriesIcon({ active = false, className }: TabIconProps): JSX.Element {
  return (
    <TabSvg active={active} className={className}>
      {active ? (
        <>
          <path d="M9.5 3.5H18a2.5 2.5 0 0 1 2.5 2.5v8.5a2.5 2.5 0 0 1-2.5 2.5V7.5A1.5 1.5 0 0 0 16.5 6H7a2.5 2.5 0 0 1 2.5-2.5Z" />
          <path
            fillRule="evenodd"
            d="M6 8h7.5a2.5 2.5 0 0 1 2.5 2.5V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18v-7.5A2.5 2.5 0 0 1 6 8Zm3.75 9.6-2.9-2.9a1.75 1.75 0 0 1 2.5-2.5l.4.4.4-.4a1.75 1.75 0 0 1 2.5 2.5l-2.9 2.9Z"
          />
        </>
      ) : (
        <>
          <path d="M7.2 7V6a2 2 0 0 1 2-2h8.8a2 2 0 0 1 2 2v8.8a2 2 0 0 1-2 2h-1" />
          <rect x="3.6" y="7.6" width="12.8" height="12.8" rx="2.4" />
          <path d="m10 17.6-2.9-2.9a1.9 1.9 0 0 1 2.7-2.7l.2.2.2-.2a1.9 1.9 0 0 1 2.7 2.7L10 17.6Z" strokeWidth={1.6} />
        </>
      )}
    </TabSvg>
  );
}
