import { useCountdown } from '../hooks.js';

// `retryAfter`: segundos que el usuario debe esperar antes de poder reintentar (límite de peticiones).
export default function StatusMessage({ kind, children, onRetry, retryAfter = 0 }) {
  const wait = useCountdown(retryAfter);

  return (
    <div className={`status status--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <p>{children}</p>
      {wait > 0 && <p>Puedes reintentar en {wait} s.</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} disabled={wait > 0}>
          Reintentar
        </button>
      )}
    </div>
  );
}
