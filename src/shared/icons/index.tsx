// Lightweight inline-SVG icon set used to replace emoji "icons" across the app.
// Stroke-based (lucide-style). Each accepts className + size and inherits color
// via currentColor. Filled variants (flame/bolt) use fill="currentColor".

type IconProps = { className?: string; size?: number };

const base = (size = 16) => ({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
});

export function FlameIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2c1.2 3 .3 4.7-1 6.2C9.6 9.8 8 11.2 8 13.8 8 16.7 10 19 12 19s4-2.3 4-5.2c0-1.5-.6-2.7-1.4-3.7.2 1-.3 1.8-1.1 2.2.5-2-.3-4.6-1.5-6.3z" />
        </svg>
    );
}

export function BoltIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13 2 4.5 13.2H11l-1 8.8L19.5 10H13l0-8z" />
        </svg>
    );
}

export function TruckIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} {...base(size)} aria-hidden="true">
            <path d="M1 4h13v11H1z" /><path d="M14 8h4l3 3v4h-7z" />
            <circle cx="6" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
        </svg>
    );
}

export function ShipIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} {...base(size)} aria-hidden="true">
            <path d="M3 13h18l-2.2 6.2a2 2 0 0 1-1.9 1.3H7.1a2 2 0 0 1-1.9-1.3z" />
            <path d="M5 13V8h14v5" /><path d="M12 3v5" />
        </svg>
    );
}

export function LockIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} {...base(size)} aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
    );
}

export function ShieldCheckIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} {...base(size)} aria-hidden="true">
            <path d="M12 3 5 6v5c0 4.3 2.9 7.6 7 9 4.1-1.4 7-4.7 7-9V6z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

export function AlertIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} {...base(size)} aria-hidden="true">
            <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
    );
}

export function HourglassIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} {...base(size)} aria-hidden="true">
            <path d="M6 3h12" /><path d="M6 21h12" />
            <path d="M7 3c0 4 4 5 5 9-1 4-5 5-5 9" /><path d="M17 3c0 4-4 5-5 9 1 4 5 5 5 9" />
        </svg>
    );
}

export function GlobeIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} {...base(size)} aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M3 12h18" />
            <path d="M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
        </svg>
    );
}

export function ReturnIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} {...base(size)} aria-hidden="true">
            <path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 5 5v1a5 5 0 0 1-5 5H7" />
        </svg>
    );
}

export function CheckIcon({ className, size = 16 }: IconProps) {
    return (
        <svg className={className} {...base(size)} aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}
