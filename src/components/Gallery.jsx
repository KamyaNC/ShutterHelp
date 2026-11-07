export default function Gallery({ shots }) {
  if (shots.length === 0) return null;
  return (
    <section className="roll" aria-label="Photos you took">
      {shots.map((s) => (
        <a key={s.id} href={s.url} download={`photo-${s.id}.jpg`} title="Save photo">
          <img src={s.url} alt={`Photo scored ${Math.round(s.score * 100)}`} />
          <span className="roll-score">{Math.round(s.score * 100)}</span>
        </a>
      ))}
    </section>
  );
}
