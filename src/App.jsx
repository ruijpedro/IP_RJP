import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import NavTabs from './components/NavTabs.jsx';
import MonthSelector from './components/MonthSelector.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Calendar from './pages/Calendar.jsx';
import Trips from './pages/Trips.jsx';
import Guards from './pages/Guards.jsx';
import Activities from './pages/Activities.jsx';
import Vehicles from './pages/Vehicles.jsx';
import Settings from './pages/Settings.jsx';
import ExportPage from './pages/ExportPage.jsx';
import Outlook from './pages/Outlook.jsx';
import About from './pages/About.jsx';
import { loadData, saveData } from './services/storage.js';
import { currentMonth, sameMonth } from './utils/date.js';

export default function App() {
  const [data, setData] = useState(loadData);
  const [tab, setTab] = useState('dashboard');
  const [month, setMonth] = useState(currentMonth());

  useEffect(() => saveData(data), [data]);

  const filtered = useMemo(() => ({
    trips: data.trips.filter(x => sameMonth(x.date, month)).sort((a, b) => String(b.date).localeCompare(String(a.date))),
    guards: data.guards.filter(x => sameMonth(x.date, month)).sort((a, b) => String(b.date).localeCompare(String(a.date))),
    activities: data.activities.filter(x => sameMonth(x.date, month)).sort((a, b) => String(b.date).localeCompare(String(a.date)))
  }), [data, month]);

  const addRecord = (key, record) => setData(d => ({ ...d, [key]: [{ ...record, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...d[key]] }));
  const deleteRecord = (key, id) => setData(d => ({ ...d, [key]: d[key].filter(x => x.id !== id) }));

  return (
    <div className="app">
      <Header profile={data.profile} />
      <main>
        <MonthSelector month={month} setMonth={setMonth} />
        <NavTabs active={tab} setActive={setTab} />
        {tab === 'dashboard' && <Dashboard month={month} {...filtered} />}
        {tab === 'calendar' && <Calendar month={month} {...filtered} />}
        {tab === 'trips' && <Trips data={data} trips={filtered.trips} addRecord={addRecord} deleteRecord={deleteRecord} />}
        {tab === 'guards' && <Guards guards={filtered.guards} addRecord={addRecord} deleteRecord={deleteRecord} />}
        {tab === 'activities' && <Activities data={data} activities={filtered.activities} addRecord={addRecord} deleteRecord={deleteRecord} />}
        {tab === 'vehicles' && <Vehicles data={data} setData={setData} />}
        {tab === 'settings' && <Settings data={data} setData={setData} />}
        {tab === 'export' && <ExportPage month={month} data={data} {...filtered} />}
        {tab === 'outlook' && <Outlook data={data} setData={setData} />}
        {tab === 'about' && <About profile={data.profile} />}
      </main>
    </div>
  );
}
