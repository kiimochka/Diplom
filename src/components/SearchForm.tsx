import React, { useState, FormEvent } from 'react';

interface SearchFormProps {
  initialFromCity?: string;
  initialToCity?: string;
  initialDate?: string;
  initialPassengers?: number;
  onSearch?: (params: {
    from: string;
    to: string;
    date: string;
    passengers: number;
  }) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  initialFromCity = '',
  initialToCity = '',
  initialDate = '',
  initialPassengers = 1,
  onSearch,
}) => {
  const [fromCity, setFromCity] = useState(initialFromCity);
  const [toCity, setToCity] = useState(initialToCity);
  const [date, setDate] = useState(initialDate);
  const [passengers, setPassengers] = useState(initialPassengers);

  const handleSubmit = (e: FormEvent) => {
  e.preventDefault();

  if (onSearch) {
    onSearch({
      from: fromCity,
      to: toCity,
      date,
      passengers,
    });
  }
};


  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Откуда"
        value={fromCity}
        onChange={e => setFromCity(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Куда"
        value={toCity}
        onChange={e => setToCity(e.target.value)}
        required
      />
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />
      <input
        type="number"
        min={1}
        value={passengers}
        onChange={e => setPassengers(Number(e.target.value))}
      />
      <button type="submit">Найти поездку</button>
    </form>
  );
};

export default SearchForm;
