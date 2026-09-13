import { whatsappUrl } from "@/lib/site";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.66 15l-1.3 4.76 4.88-1.28A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-2.9.76.78-2.82-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8s-.39-.12-.55.12-.63.8-.78.97-.29.18-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.33a.46.46 0 0 0-.02-.43c-.06-.12-.55-1.33-.76-1.82s-.4-.41-.55-.42h-.47a.9.9 0 0 0-.66.31 2.76 2.76 0 0 0-.86 2.05 4.8 4.8 0 0 0 1 2.54 11 11 0 0 0 4.2 3.7c1.56.68 2.18.73 2.96.62a2.53 2.53 0 0 0 1.66-1.17 2.05 2.05 0 0 0 .14-1.17c-.06-.1-.22-.16-.47-.28z"
      />
    </svg>
  );
}

/** Always within reach: someone who wants to write should not have to find the contact chapter first. */
export function WhatsAppButton({ label, message }: { label: string; message: string }) {
  return (
    <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label={label}>
      <WhatsAppIcon className="wa-icon" />
      <span className="wa-float-text">{label}</span>
    </a>
  );
}
