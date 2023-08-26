import { WaitList } from '@/Waitlist';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CoolShadow } from '@/CoolShadow';
import { Tweet as _Tweet } from 'react-tweet';
const Tweet = _Tweet as any as (
  props: Parameters<typeof _Tweet>[0],
) => JSX.Element;

const TwitterLink = () => {
  return (
    <a
      target="_blank"
      href="https://twitter.com/judehunterdev"
      rel="noopener noreferrer"
    >
      <svg
        className="inline-block"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 256 256"
      >
        <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path>
      </svg>
    </a>
  );
};

const GithubLink = () => {
  return (
    <a
      target="_blank"
      href="https://github.com/judehunter/motioned"
      rel="noopener noreferrer"
    >
      <svg
        className="inline-block"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 256 256"
      >
        <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"></path>
      </svg>
    </a>
  );
};

const Tweets = () => {
  return (
    <div
      className="tweet mt-24 xl:ml-[calc((100%-72rem)/2-2%)] px-8 pb-10 flex items-start gap-x-6 flex-wrap"
      data-theme="dark"
    >
      <Tweet id="1693334513823191100" />
      <Tweet id="1689318516581703683" />
    </div>
  );
};

const icons = {
  Figma: ({ ...rest }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="currentColor"
      viewBox="0 0 256 256"
      {...rest}
    >
      <path d="M184,96a40,40,0,0,0-24-72H88A40,40,0,0,0,64,96a40,40,0,0,0,1.37,65A44,44,0,1,0,136,196V160a40,40,0,1,0,48-64Zm0-32a24,24,0,0,1-24,24H136V40h24A24,24,0,0,1,184,64ZM64,64A24,24,0,0,1,88,40h32V88H88A24,24,0,0,1,64,64Zm24,88a24,24,0,0,1,0-48h32v48H88Zm32,44a28,28,0,1,1-28-28h28Zm40-44a24,24,0,1,1,24-24A24,24,0,0,1,160,152Z"></path>
    </svg>
  ),
  Code: ({ ...rest }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="currentColor"
      viewBox="0 0 256 256"
      {...rest}
    >
      <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"></path>
    </svg>
  ),
  Plus: ({ ...rest }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="currentColor"
      viewBox="0 0 256 256"
      {...rest}
    >
      <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
    </svg>
  ),
  Equals: ({ ...rest }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="currentColor"
      viewBox="0 0 256 256"
      {...rest}
    >
      <path d="M224,160a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,160ZM40,104H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Z"></path>
    </svg>
  ),
  Faders: ({ ...rest }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="currentColor"
      viewBox="0 0 256 256"
      {...rest}
    >
      <path d="M136,120v96a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm64,72a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V200A8,8,0,0,0,200,192Zm24-32H208V40a8,8,0,0,0-16,0V160H176a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16ZM56,160a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V168A8,8,0,0,0,56,160Zm24-32H64V40a8,8,0,0,0-16,0v88H32a8,8,0,0,0,0,16H80a8,8,0,0,0,0-16Zm72-48H136V40a8,8,0,0,0-16,0V80H104a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16Z"></path>
    </svg>
  ),
  Waves: ({ ...rest }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="currentColor"
      viewBox="0 0 256 256"
      {...rest}
    >
      <path d="M34.33,77.68a8,8,0,0,1,0-11.34C35.1,65.59,53.1,48,88,48c18.42,0,32.24,9.21,44.44,17.34C143.74,72.88,154.42,80,168,80a72.21,72.21,0,0,0,31.75-6.83,44.87,44.87,0,0,0,10.63-6.87,8,8,0,0,1,11.27,11.36C220.9,78.41,202.9,96,168,96c-18.42,0-32.24-9.21-44.44-17.34C112.26,71.12,101.58,64,88,64a72.21,72.21,0,0,0-31.75,6.83A44.87,44.87,0,0,0,45.62,77.7,8,8,0,0,1,34.33,77.68ZM210.38,122.3a44.87,44.87,0,0,1-10.63,6.87A72.21,72.21,0,0,1,168,136c-13.58,0-24.26-7.12-35.56-14.66C120.24,113.21,106.42,104,88,104c-34.9,0-52.9,17.59-53.65,18.34A8,8,0,0,0,45.62,133.7a44.87,44.87,0,0,1,10.63-6.87A72.21,72.21,0,0,1,88,120c13.58,0,24.26,7.12,35.56,14.66,12.2,8.13,26,17.34,44.44,17.34,34.9,0,52.9-17.59,53.65-18.34a8,8,0,0,0-11.27-11.36Zm0,56a44.87,44.87,0,0,1-10.63,6.87A72.21,72.21,0,0,1,168,192c-13.58,0-24.26-7.12-35.56-14.66C120.24,169.21,106.42,160,88,160c-34.9,0-52.9,17.59-53.65,18.34A8,8,0,0,0,45.62,189.7a44.87,44.87,0,0,1,10.63-6.87A72.21,72.21,0,0,1,88,176c13.58,0,24.26,7.12,35.56,14.66,12.2,8.13,26,17.34,44.44,17.34,34.9,0,52.9-17.59,53.65-18.34a8,8,0,0,0-11.27-11.36Z"></path>
    </svg>
  ),
};

const EquationBanner = () => {
  const bigStyles = 'w-[24px] h-[24px] lg:w-[48px] lg:h-[48px]';
  const smallStyles = 'w-[16px] h-[16px] lg:w-[32px] lg:h-[32px]';
  return (
    <div className="flex items-center lg:gap-x-8 gap-x-3 text-white">
      <icons.Figma
        className={`${bigStyles} animate-[wave_4s_ease-in-out_infinite_-2.4s]`}
      />
      <icons.Plus
        className={`${smallStyles} animate-[wave_4s_ease-in-out_infinite_-2s]`}
      />
      <icons.Code
        className={`${bigStyles} animate-[wave_4s_ease-in-out_infinite_-1.6s]`}
      />
      <icons.Plus
        className={`${smallStyles} animate-[wave_4s_ease-in-out_infinite_-1.2s]`}
      />
      <icons.Faders
        className={`${bigStyles} animate-[wave_4s_ease-in-out_infinite_-0.8s]`}
      />
      <icons.Equals
        className={`${smallStyles} animate-[wave_4s_ease-in-out_infinite_-0.4s]`}
      />
      <icons.Waves
        className={`${bigStyles} animate-[wave_4s_ease-in-out_infinite_-0s]`}
      />
    </div>
  );
};

export default function Home() {
  return (
    <div>
      <div className="mt-48 max-w-6xl mx-auto px-8 text-white text-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-x-4">
              <CoolShadow
                shadows={[
                  'text-[#037d44]',
                  'text-gray-600',
                  'text-gray-500',
                  'text-gray-400',
                ]}
                offset={3}
              >
                Motioned
              </CoolShadow>

              {/* Spacer */}
              <div />
              <TwitterLink />
              <GithubLink />
            </div>

            <p className="max-w-md text-slate-200 mt-4">
              The animation toolkit: Figma → code → devtools, fueled by WAAPI.{' '}
              <a
                className="decoration underline"
                target="_blank"
                href="https://github.com/judehunter/motioned"
                rel="noopener noreferrer"
              >
                Star on Github
              </a>
            </p>
          </div>
          <div>
            <EquationBanner />
          </div>
        </div>

        <WaitList />
      </div>

      <Tweets />
    </div>
  );
}
