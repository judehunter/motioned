export const WaitList = () => {
  return (
    <form
      className="flex gap-6 mt-14 mb-7"
      onSubmit={(ev) => {
        ev.preventDefault();

        const email = ev.target[0].value;
      }}
    >
      <input
        type="text"
        className="border rounded-md bg-transparent p-3 w-1/3"
        placeholder="Waitlist (Email)"
      />
      <button
        className="py-3 px-8 bg-gradient-to-tr from-[#defff8] to-[#b1fee9] text-gray-900 gap-4 rounded-md"
        type="submit"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="#0a0606"
          viewBox="0 0 256 256"
        >
          <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,16V152h-28.7A15.86,15.86,0,0,0,168,156.69L148.69,176H107.31L88,156.69A15.86,15.86,0,0,0,76.69,152H48V48Zm0,160H48V168H76.69L96,187.31A15.86,15.86,0,0,0,107.31,192h41.38A15.86,15.86,0,0,0,160,187.31L179.31,168H208v40Z"></path>
        </svg>
      </button>
    </form>
  );
};
