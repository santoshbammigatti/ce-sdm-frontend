export default function Spinner({ size = "medium", text = "" }) {
  const sizes = {
    small: { spinner: "20px", border: "2px" },
    medium: { spinner: "40px", border: "3px" },
    large: { spinner: "60px", border: "4px" }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <div className="spinner-container">
      <div 
        className="spinner" 
        style={{
          width: currentSize.spinner,
          height: currentSize.spinner,
          borderWidth: currentSize.border
        }}
      />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
