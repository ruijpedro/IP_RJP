export default function About({ profile }) {
  return (
    <section className="panel about">
      <h2>IP_RJP</h2>
      <p><b>Autor</b><br />{profile.author}</p>
      <p>{profile.organization}</p>
      <p>© {profile.year}</p>
    </section>
  );
}
