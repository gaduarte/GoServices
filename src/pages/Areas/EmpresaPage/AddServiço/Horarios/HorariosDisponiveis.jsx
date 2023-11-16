import React, { useState } from "react";

const WorkingDaysComponent = ({ onDaysSelecionado }) => {
  const [selectedDays, setSelectedDays] = useState([]);

  const handleDaySelection = (day) => {
    const date = new Date(day); // Converter o dia para uma instância de Date
    const updatedSelectedDays = [...selectedDays];
    const dayIndex = selectedDays.findIndex((selectedDay) => selectedDay.getTime() === date.getTime());

    if (dayIndex === -1) {
      updatedSelectedDays.push(date);
    } else {
      updatedSelectedDays.splice(dayIndex, 1);
    }

    setSelectedDays(updatedSelectedDays);
    onDaysSelecionado(updatedSelectedDays); // Chame a função de retorno com os dias selecionados
  };

  return (
    <div>
      <h2>Dias de trabalho:</h2>
      <ul>
        {selectedDays.map((day, index) => (
          <li key={index}>
            {day.toDateString()}
          </li>
        ))}
      </ul>
      <button onClick={() => handleDaySelection(new Date())}>Selecionar Hoje</button>
    </div>
  );
};

export default WorkingDaysComponent;


