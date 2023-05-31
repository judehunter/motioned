import { m } from 'motioned';
import { useState } from 'react';

const Anim = () => {
  const [x, setX] = useState(10);
  const [y, setY] = useState(10);
  return (
    <m.div
      initial={{}}
      animate={{ x, y }}
      className="w-16 h-16 bg-green-500"
      role="button"
      onClick={() => {
        setX(Math.random() * 50);
        setY(Math.random() * 50);
      }}
    ></m.div>
  );
};
function App() {
  return (
    <>
      <div className="max-w-xl mx-auto p-20">
        <Anim />
      </div>
    </>
  );
}

export default App;
