function Commentary({ commentary }) {
  return (
    <div className="commentary">
      <h3>Commentary</h3>
      <ul>
        {commentary.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

export default Commentary;
