import React, { useState} from 'react';
import './calendar.css';

interface CalendarProps {
  events: any[];  // Accept events as a prop
}

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Category colors based on category_id
  const categoryColors: { [key: number]: string } = {
    1: "#7aaf7cff",  // Life Events
    2: "#364c63",  // Church Business Events
    3: "#f5e784ff",  // Community Events
    4: "#AF907A",  // Spiritual Events
    5: "#1D1411",  // Other
  };

  const renderMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];

    // Days of the week header
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach((day, i) => {
      grid.push(
        <div key={`header-${i}`} className="day-header">
          {day}
        </div>
      );
    });

    // Empty cells before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="day"></div>);
    }

    // Generate day cells for the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = currentDate.getDate() === d && currentDate.getMonth() === month && currentDate.getFullYear() === year;
      const cellClass = isToday ? "day today" : "day";

      const cell = (
        <div key={d} className={cellClass} onClick={() => openEventModal(null, dateStr)}>
          <div className="day-number">{d}</div>
          {events.filter((e) => e.date === dateStr).map((e) => {
            // Set the category color based on category_id
            const borderColor = categoryColors[e.category_id] || "#ccc"; // Default to gray if no category match
            return (
              <div key={e.id} className="event" style={{ borderLeft: `6px solid ${borderColor}` }}>
                {e.name}
                <div className="tooltip">
                  <strong>Title:</strong> {e.name}<br />
                  <strong>Time:</strong> {e.start}<br />
                  <strong>Description:</strong> {e.description}<br />
                  <strong>Venue:</strong> {e.venue}
                </div>
              </div>
            );
          })}
        </div>
      );
      grid.push(cell);
    }

    return <div className="month-view">{grid}</div>;
  };

  const handlePrevClick = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1); // Only change month
    setCurrentDate(newDate);
  };

  const handleNextClick = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1); // Only change month
    setCurrentDate(newDate);
  };

  const openEventModal = (id: string | null, date?: string) => {
    if (id) {
      const event = events.find((e) => e.id === id);
      setSelectedEvent(event);
    } else {
      setSelectedEvent({
        id: Date.now().toString(),
        name: '',
        date: date || '',
        start: '09:00',
        end: '17:00',
        description: '',
        venue: '',
        event_type: ''
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const eventData = {
      id: selectedEvent?.id || Date.now().toString(),
      name: form['eventTitle'].value,
      date: form['eventDate'].value,
      start: form['eventStart'].value,
      end: form['eventEnd'].value,
      description: form['eventDesc'].value,
      venue: form['eventVenue'].value,
      event_type: form['eventType'].value
    };

    if (selectedEvent) {
      setSelectedEvent(eventData);  // Update selected event
    } else {
      setSelectedEvent(eventData);  // Add new event
    }

    saveEvents();
    closeModal();
  };

  const saveEvents = () => {
    localStorage.setItem('events', JSON.stringify(events));
  };

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <button className='cal-btn' onClick={handlePrevClick}>
          <span className="text">&larr; &nbsp; Prev</span>
        </button>
        <h1>{`${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`}</h1>
        <button className='cal-btn' onClick={handleNextClick}>
          <span className="text">Next &nbsp; &rarr;</span>
        </button>
      </header>

      <div className="calendar-body">
        {renderMonth()} {/* Always show the month view */}
      </div>

      {modalOpen && (
        <div className="modal">
          <form onSubmit={handleEventSubmit}>
            <h2>{selectedEvent ? 'Edit Event' : 'Create Event'}</h2>
            <label>
              Title:
              <input type="text" name="eventTitle" defaultValue={selectedEvent?.name || ''} required />
            </label>
            <label>
              Date:
              <input type="date" name="eventDate" defaultValue={selectedEvent?.date || ''} required />
            </label>
            <label>
              Start Time:
              <input type="time" name="eventStart" defaultValue={selectedEvent?.start || '09:00'} required />
            </label>
            <label>
              End Time:
              <input type="time" name="eventEnd" defaultValue={selectedEvent?.end || '17:00'} />
            </label>
            <label>
              Venue:
              <input type="text" name="eventVenue" defaultValue={selectedEvent?.venue || ''} />
            </label>
            <label>
              Description:
              <textarea name="eventDesc" defaultValue={selectedEvent?.description || ''} />
            </label>
            <label>
              Event Type:
              <input type="text" name="eventType" defaultValue={selectedEvent?.event_type || ''} />
            </label>

            <div className="modal-actions">
              <button type="button" onClick={closeModal}>Cancel</button>
              <button type="submit">Save Event</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Calendar;
