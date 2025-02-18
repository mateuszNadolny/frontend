'use client';

import { React, useState, useEffect } from 'react';

import { useSelector } from 'react-redux';

import { groupBy } from 'lodash';
import { compareAsc, parse, format } from 'date-fns';

import { getMedicinesForDay } from '@/libs/utils/getMedicinesForDay';

import MedicationScheduleCard from './MedicationScheduleCard';
import AddMedicationToScheduleForm from '../Forms/AddMedicationToSchedule/AddMedicationForm';

import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';

const MedicationSchedule = () => {
  const [date, setDate] = useState(new Date());
  const family = useSelector((state) => state.family);
  const scheduledMedicines = useSelector((state) => state.schedule);
  const [selectedMember, setSelectedMember] = useState(family[0]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const result = getMedicinesForDay(scheduledMedicines, date, selectedMember);
    setMedicines(result);
  }, [scheduledMedicines, date, selectedMember]);

  return (
    <Card className="md:mx-3">
      <h2 className="font-medium font-bold mb-4">
        Scheduled medications for <span className="text-primary">{selectedMember.name}</span>
      </h2>
      <div className="flex flex-column md:flex-row gap-2 mb-3">
        <Dropdown
          options={family}
          optionLabel="name"
          className="w-full md:w-3 lg:w-2"
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.value)}
        />
        <div className="flex justify-content-between">
          <Calendar
            value={date}
            onChange={(e) => setDate(e.value)}
            dateFormat="dd/MM/yy"
            className="w-full"
          />
        </div>
        <AddMedicationToScheduleForm />
      </div>
      <div className={`overflow-auto border-round-md p-3 border-solid border-gray-400 container`}>
        {medicines.length < 1 &&
          'Seems like there are no scheduled medications found for selected day.'}
        {Object.entries(groupBy(medicines, 'time'))
          .sort(([timeA], [timeB]) =>
            compareAsc(parse(timeA, 'HH:mm:ss', new Date()), parse(timeB, 'HH:mm:ss', new Date()))
          )
          .map(([time, medicinesGroup]) => {
            const formattedTime = format(parse(time, 'HH:mm:ss', new Date()), 'HH:mm');

            return (
              <div key={time}>
                <Divider align="left">
                  <div className="inline-flex align-items-center">
                    <b>{formattedTime}</b>
                  </div>
                </Divider>
                {medicinesGroup.map((medicine) => (
                  <MedicationScheduleCard key={medicine.id} medicine={medicine} date={date} />
                ))}
              </div>
            );
          })}
      </div>
    </Card>
  );
};

export default MedicationSchedule;
