import { useCallback, useEffect, useRef, useState, createContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faX } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import StatusMessage, { MESSAGE } from './components/StatusMessage/StatusMessage';
import './main.scss';

type SET_MESSAGE_FUNCTION = (message: MESSAGE | null) => void;
export const StatusMessageContext = createContext<SET_MESSAGE_FUNCTION>(null);

export default function Layout() {
  const ref = useRef(null);
  const [message, setMessage] = useState<MESSAGE | null>(null);
  const [showNav, setShowNav] = useState<boolean>(false);
  const hide = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement).id === 'app') setShowNav(false);
  }, []);

  useEffect(() => {
    document.querySelector('#app').classList.toggle('blur', showNav);
    ref.current.focus();

    if (showNav) {
      window.addEventListener('click', hide);
    } else {
      window.removeEventListener('click', hide);
    }
  }, [showNav]);

  return <StatusMessageContext.Provider value={setMessage}>
    <button ref={ref} className={classNames('burger-menu', { 'hide': showNav })} onClick={() => setShowNav(!showNav)}><FontAwesomeIcon icon={faBars} /></button>
    <nav className={showNav ? 'show' : ''}>
      <button onClick={() => setShowNav(!showNav)}><FontAwesomeIcon icon={faX} /></button>
      <h2>Modes</h2>
      <ul>
        <li><Link to="/" onClick={() => setShowNav(false)}>Static</Link></li>
        <li><Link to="/breathing" onClick={() => setShowNav(false)}>Breathing</Link></li>
        <li><Link to="/fade" onClick={() => setShowNav(false)}>Fade</Link></li>
      </ul>
    </nav>
    <StatusMessage message={message} />
    <Outlet />
  </StatusMessageContext.Provider>;
}