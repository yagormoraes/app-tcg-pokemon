import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Procurar Itens' },
  { to: '/empty', label: 'Página Vazia' },
];

export default function Sidebar() {
  return (
    <nav className="w-64 bg-white border-r">
      <div className="p-6 text-xl font-bold">Meu App</div>
      <ul>
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                'block px-6 py-3 hover:bg-gray-200 ' +
                (isActive ? 'bg-gray-200 font-semibold' : '')
              }
              end
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
