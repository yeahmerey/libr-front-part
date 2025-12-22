// src/components/RatingInput/RatingInput.jsx
export default function RatingInput({ value, onChange }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", marginBottom: "6px" }}>Rating:</label>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: star <= value ? "#FFD700" : "#ccc",
            }}
          >
            ⭐
          </button>
        ))}
        <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
          {value}/5
        </span>
      </div>
    </div>
  );
}
