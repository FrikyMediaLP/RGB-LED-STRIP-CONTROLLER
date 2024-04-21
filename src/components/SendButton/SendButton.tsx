import { useState } from 'react';
import { JSON_RESPONSE } from '../../helper/ArduinoAPI';
import LoadingRing from '../LoadingRing/LoadingRing';
import './SendButton.scss';

type Props = {
  onClick: () => Promise<JSON_RESPONSE>,
  onSuccess?: (result: JSON_RESPONSE) => void,
  onError?: (error: Error) => void,
  onFinally?: () => void
};

export default function SendButton({ onClick, onSuccess, onError, onFinally }: Props) {
  const [loading, setLoading] = useState<boolean>(false);

  async function send() {
    if(loading) return;
    setLoading(true);

    try {
      const result = await onClick();
      if (onSuccess) onSuccess(result);
    } catch (error) {
      if (onError) onError(error);
    } finally {
      if (onFinally) onFinally();
      setLoading(false);
    }
  }

  return <div className='send-button'>
    <button className='send' onClick={send}>
      { loading && <div><LoadingRing /></div> || 'APPLY' }
    </button>
  </div>;
}