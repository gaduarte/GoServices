import React, { useState } from "react";

const WorkingHoursComponent = ({ onHorarioSelecionado }) => {
  const [workingHours, setWorkingHours] = useState([]);

  const handleCheckboxChange = (hour) => {
    const updatedHours = [...workingHours];
    const hourIndex = updatedHours.indexOf(hour);

    if (hourIndex === -1) {
      updatedHours.push(hour);
    } else {
      updatedHours.splice(hourIndex, 1);
    }

    setWorkingHours(updatedHours);
    onHorarioSelecionado(updatedHours); // Chame a função de retorno com as horas selecionadas
  };

  return (
    <div>
      <h2>Horários de trabalho:</h2>
      <ul>
        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
          <li key={hour}>
            <input
              type="checkbox"
              checked={workingHours.includes(hour)}
              onChange={() => handleCheckboxChange(hour)}
            />
            {`${hour}:00`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkingHoursComponent;
