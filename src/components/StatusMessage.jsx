export default function StatusMessage({ kind, children, onRetry }) {
  return (
    <div className={`status status--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <p>{children}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
