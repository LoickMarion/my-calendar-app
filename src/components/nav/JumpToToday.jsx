import React from 'react';

export default function JumpToToday({ setCurrent, setSelectedDate }) {
  function handleClick() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // update calendar view
    setCurrent({ year, month });


    // select today's date — must be a Date object!
    setSelectedDate(now);
  }

  return (
    <button className="btn" onClick={handleClick}>
      Today
    </button>
  );
}
