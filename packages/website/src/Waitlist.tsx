'use client';
import { useState } from 'react';

export const WaitList = () => {
  const [state, setState] = useState<null | 'loading' | 'done' | 'error'>(null);
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    setState('loading');

    const result = await fetch('/motioned/api/waitlist', {
      body: JSON.stringify({ email }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });

    if (result.status === 200) {
      setState('done');
      setTimeout(() => {
        setState(null);
        setEmail('');
      }, 3_000);
    } else {
      setState('error');
    }
  };

  return (
    <form
      className="gap-6 mt-14 mb-7 lg:flex space-y-4 lg:space-y-0"
      onSubmit={async (ev) => {
        ev.preventDefault();

        handleSubmit();
      }}
    >
      <input
        type="email"
        className="border-[#defff8] border-2 rounded-md bg-transparent p-3 lg:w-1/3 w-full outline-none"
        placeholder="Waitlist (Email)"
        disabled={state === 'loading' || state === 'done'}
        required
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
      />
      <button
        className={`py-3 px-8 bg-gradient-to-tr from-[#defff8] to-[#b1fee9] text-gray-900 gap-4 rounded-md lg:w-auto w-full ${
          state === 'loading' ? 'animate-gradient' : ''
        } `}
        type="submit"
        disabled={state === 'loading' || state === 'done'}
      >
        {state === 'loading' ? (
          'Adding...'
        ) : state === 'done' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="#0a0606"
            viewBox="0 0 256 256"
          >
            <path d="M111.49,52.63a15.8,15.8,0,0,0-26,5.77L33,202.78A15.83,15.83,0,0,0,47.76,224a16,16,0,0,0,5.46-1l144.37-52.5a15.8,15.8,0,0,0,5.78-26Zm-8.33,135.21-35-35,13.16-36.21,58.05,58.05Zm-55,20,14-38.41,24.45,24.45ZM156,168.64,87.36,100l13-35.87,91.43,91.43ZM160,72a37.8,37.8,0,0,1,3.84-15.58C169.14,45.83,179.14,40,192,40c6.7,0,11-2.29,13.65-7.21A22,22,0,0,0,208,23.94,8,8,0,0,1,224,24c0,12.86-8.52,32-32,32-6.7,0-11,2.29-13.65,7.21A22,22,0,0,0,176,72.06,8,8,0,0,1,160,72ZM136,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm101.66,82.34a8,8,0,1,1-11.32,11.31l-16-16a8,8,0,0,1,11.32-11.32Zm4.87-42.75-24,8a8,8,0,0,1-5.06-15.18l24-8a8,8,0,0,1,5.06,15.18Z"></path>
          </svg>
        ) : state === 'error' ? (
          <div className="flex items-center gap-2">
            <span>Nope. Try again?</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="#0a0606"
              viewBox="0 0 256 256"
            >
              <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
            </svg>
          </div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="#0a0606"
            viewBox="0 0 256 256"
            className="mx-auto"
          >
            <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,16V152h-28.7A15.86,15.86,0,0,0,168,156.69L148.69,176H107.31L88,156.69A15.86,15.86,0,0,0,76.69,152H48V48Zm0,160H48V168H76.69L96,187.31A15.86,15.86,0,0,0,107.31,192h41.38A15.86,15.86,0,0,0,160,187.31L179.31,168H208v40Z"></path>
          </svg>
        )}
      </button>
    </form>
  );
};
