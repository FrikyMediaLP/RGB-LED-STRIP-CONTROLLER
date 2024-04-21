import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import './StatusMessage.scss';

export type MESSAGE = {
  type: 'info' | 'warning' | 'error',
  title?: string,
  text?: string,
  description?: string
};

const FADE_OUT_DELAY = 10;

export default function StatusMessage({ message }: { message: MESSAGE | null }) {
  const [msg, setMsg] = useState<MESSAGE | null>(message);

  useEffect(() => {
    setMsg(message);
    if (!message) return;

    const timeout = setTimeout(() => {
      setMsg(null);
    }, FADE_OUT_DELAY * 1000);

    return () => clearTimeout(timeout);
  }, [message]);

  return <>
    {
      msg && (
        <div key={message.type} className={classNames('status-message', msg?.type ? { [msg.type]: true } : null)}>
          {<button onClick={() => setMsg(null)}><FontAwesomeIcon icon={faX} /></button>}
          {msg.title && <span className='title'>{msg.title}</span>}
          {msg.text && <span className='text'>{msg.text}</span>}
          {msg.description && <span className='description'>{msg.description}</span>}
        </div>
      )
    }
  </>;
}