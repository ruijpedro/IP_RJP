export default function Header({ profile }) {
  return (
    <header className="topbar">
      <div className="brand">
        <img src="/icons/icon-512.png" alt="IP_RJP" />
        <div>
          <b>{profile.appName}</b>
          <span>{profile.subtitle}</span>
        </div>
      </div>
    </header>
  );
}
