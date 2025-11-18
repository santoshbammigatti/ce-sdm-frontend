export default function Modal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            No
          </button>
          <button className="btn primary" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
