import React, { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  CARS_STORAGE_KEY,
  Car,
  TRIPS_STORAGE_KEY,
  Trip,
  TripType,
  RouteMode,
} from "../types";
import "../styles/createtrip.css";
import PageHeader from "../components/layout/PageHeader";
import { useToast } from "../context/ToastContext";
import {
  cargoServiceOptions,
  cargoTypeOptions,
  cargoVehicleTypeOptions,
} from "../data/cargoOptions";
import { calculateCargoPriceEstimate } from "../utils/cargoPricing";
import { calculatePassengerPriceEstimate } from "../utils/passengerPricing";
import { readTrips } from "../utils/tripsStorage";

interface CreateTripForm {
  fromCity: string;
  toCity: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  pricePerSeat: number;
  freeSeats: string;
  comment: string;
}

interface CargoForm {
  cargoTypes: string[];
  cargoLength: string;
  cargoHeight: string;
  cargoWidth: string;
  cargoWeight: string;
  cargoVehicleType: string;
  cargoServices: string[];
  pricePerCar: string; // строка
}

interface CarForm {
  brand: string;
  model: string;
  color: string;
  plate: string;
}

const getCarTitle = (car: Car) =>
  `${car.brand} ${car.model}${car.color ? ` (${car.color})` : ""}`;

const readStoredCars = (): Car[] => {
  const stored = localStorage.getItem(CARS_STORAGE_KEY);

  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as Car[]) : [];
  } catch {
    return [];
  }
};

const CreateTripPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [editableTrip, setEditableTrip] = useState<Trip | null>(null);
  const [isTripLoaded, setIsTripLoaded] = useState(!isEditMode);
  const [hasInitializedEditForm, setHasInitializedEditForm] = useState(false);
  const [isSaveComplete, setIsSaveComplete] = useState(false);
  const initialSnapshotRef = useRef<string>("");

  const [tripType, setTripType] = useState<TripType>("passenger");
  const [cargoRouteMode, setCargoRouteMode] = useState<RouteMode>("intercity");

  const [form, setForm] = useState<CreateTripForm>({
    fromCity: "",
    toCity: "",
    date: "",
    departureTime: "",
    arrivalTime: "",
    pricePerSeat: 0,
    freeSeats: "1",
    comment: "",
  });

  const [cargoForm, setCargoForm] = useState<CargoForm>({
    cargoTypes: [],
    cargoLength: "",
    cargoHeight: "",
    cargoWidth: "",
    cargoWeight: "",
    cargoVehicleType: "",
    cargoServices: [],
    pricePerCar: "",
  });

  const [stops, setStops] = useState<string[]>([""]);

  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [isCarFormOpen, setIsCarFormOpen] = useState(false);
  const [carForm, setCarForm] = useState<CarForm>({
    brand: "",
    model: "",
    color: "",
    plate: "",
  });

  const [amenities, setAmenities] = useState({
    childSeat: false,
    petsAllowed: false,
    smokingAllowed: false,
    luggageAllowed: false,
  });

  useEffect(() => {
    if (!isEditMode) return;

    const foundTrip = readTrips().find((trip) => trip.id === id) ?? null;
    setEditableTrip(foundTrip);
    setIsTripLoaded(true);
  }, [id, isEditMode]);

  useEffect(() => {
    if (!user) return;

    setCars(readStoredCars().filter((car) => car.ownerId === user.id));
  }, [user]);

  useEffect(() => {
    if (!isEditMode || !editableTrip || hasInitializedEditForm) return;

    setTripType(editableTrip.type);
    setCargoRouteMode(editableTrip.routeMode ?? "intercity");
    setForm({
      fromCity: editableTrip.fromCity,
      toCity: editableTrip.toCity,
      date: editableTrip.date,
      departureTime: editableTrip.departureTime,
      arrivalTime: editableTrip.arrivalTime,
      pricePerSeat: editableTrip.pricePerSeat,
      freeSeats: String(editableTrip.freeSeats),
      comment: editableTrip.comment ?? "",
    });
    setCargoForm({
      cargoTypes: editableTrip.cargoTypes ?? [],
      cargoLength:
        editableTrip.cargoLength !== undefined
          ? String(editableTrip.cargoLength)
          : "",
      cargoHeight:
        editableTrip.cargoHeight !== undefined
          ? String(editableTrip.cargoHeight)
          : "",
      cargoWidth:
        editableTrip.cargoWidth !== undefined ? String(editableTrip.cargoWidth) : "",
      cargoWeight:
        editableTrip.cargoWeight !== undefined
          ? String(editableTrip.cargoWeight)
          : "",
      cargoVehicleType: editableTrip.cargoVehicleType ?? "",
      cargoServices: editableTrip.cargoServices ?? [],
      pricePerCar:
        editableTrip.pricePerCar !== undefined
          ? String(editableTrip.pricePerCar)
          : "",
    });
    setStops(editableTrip.stops?.length ? editableTrip.stops : [""]);
    setSelectedCarId(editableTrip.carId ?? "");
    setAmenities(
      editableTrip.amenities ?? {
        childSeat: false,
        petsAllowed: false,
        smokingAllowed: false,
        luggageAllowed: false,
      },
    );
    setHasInitializedEditForm(true);
  }, [editableTrip, hasInitializedEditForm, isEditMode]);

  const cargoPriceEstimate = useMemo(
    () =>
      calculateCargoPriceEstimate({
        fromCity: form.fromCity,
        toCity: cargoRouteMode === "city" ? form.fromCity : form.toCity,
        cargoTypes: cargoForm.cargoTypes,
        cargoLength: cargoForm.cargoLength,
        cargoHeight: cargoForm.cargoHeight,
        cargoWidth: cargoForm.cargoWidth,
        cargoWeight: cargoForm.cargoWeight,
        cargoServices: cargoForm.cargoServices,
      }),
    [
      form.fromCity,
      form.toCity,
      cargoRouteMode,
      cargoForm.cargoTypes,
      cargoForm.cargoLength,
      cargoForm.cargoHeight,
      cargoForm.cargoWidth,
      cargoForm.cargoWeight,
      cargoForm.cargoServices,
    ],
  );

  const passengerPriceEstimate = useMemo(
    () =>
      calculatePassengerPriceEstimate({
        fromCity: form.fromCity,
        toCity: form.toCity,
        amenities,
      }),
    [form.fromCity, form.toCity, amenities],
  );

  const formSnapshot = useMemo(
    () =>
      JSON.stringify({
        tripType,
        cargoRouteMode,
        form,
        cargoForm,
        stops,
        selectedCarId,
        amenities,
      }),
    [
      amenities,
      cargoForm,
      cargoRouteMode,
      form,
      selectedCarId,
      stops,
      tripType,
    ],
  );

  useEffect(() => {
    if (!isEditMode || !hasInitializedEditForm || initialSnapshotRef.current) {
      return;
    }

    initialSnapshotRef.current = formSnapshot;
  }, [formSnapshot, hasInitializedEditForm, isEditMode]);

  const hasUnsavedChanges =
    isEditMode &&
    hasInitializedEditForm &&
    !isSaveComplete &&
    Boolean(initialSnapshotRef.current) &&
    formSnapshot !== initialSnapshotRef.current;

  const selectedCar = useMemo(
    () => cars.find((car) => car.id === selectedCarId),
    [cars, selectedCarId],
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const message = "У вас есть несохранённые изменения. Покинуть страницу?";
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!link || link.target || link.download) return;
      if (link.origin !== window.location.origin) return;

      const nextPath = `${link.pathname}${link.search}${link.hash}`;
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (nextPath === currentPath) return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const handlePopState = () => {
      if (!window.confirm(message)) {
        window.history.go(1);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  const isDateOrTimeChanged =
    isEditMode &&
    editableTrip &&
    editableTrip.status !== "cancelled" &&
    (form.date !== editableTrip.date ||
      form.departureTime !== editableTrip.departureTime ||
      form.arrivalTime !== editableTrip.arrivalTime);

  if (!user) {
    return (
      <div className="create-trip-page">
        <PageHeader
          title={isEditMode ? "Редактировать поездку" : "Создать поездку"}
          fallback="/profile"
        />
        <p>
          Для {isEditMode ? "редактирования" : "создания"} поездки необходимо
          войти в личный кабинет.
        </p>
        <div className="create-trip-auth-actions">
          <button
            type="button"
            className="create-trip-auth-button create-trip-auth-button--primary"
            onClick={() => navigate("/login")}
          >
            Войти
          </button>
          <button
            type="button"
            className="create-trip-auth-button create-trip-auth-button--secondary"
            onClick={() => navigate("/register")}
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    );
  }

  if (isEditMode && !isTripLoaded) {
    return (
      <div className="create-trip-page">
        <PageHeader title="Редактировать поездку" fallback="/profile" />
        <p>Загрузка поездки...</p>
      </div>
    );
  }

  if (isEditMode && !editableTrip) {
    return (
      <div className="create-trip-page">
        <PageHeader title="Редактировать поездку" fallback="/profile" />
        <p>Поездка не найдена.</p>
      </div>
    );
  }

  if (isEditMode && editableTrip?.driver.id !== user.id) {
    return (
      <div className="create-trip-page">
        <PageHeader title="Редактировать поездку" fallback="/profile" />
        <p>Редактировать поездку может только её автор.</p>
      </div>
    );
  }

  const handleChange = <K extends keyof CreateTripForm>(
    field: K,
    value: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: typeof prev[field] === "number" ? Number(value) : value,
    }));
  };

  const handleCarChange = (field: keyof CarForm, value: string) => {
    setCarForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetCarForm = () => {
    setCarForm({
      brand: "",
      model: "",
      color: "",
      plate: "",
    });
  };

  const handleAddCar = () => {
    if (!user) return;

    if (!carForm.brand.trim() || !carForm.model.trim()) {
      alert("Марка и модель обязательны.");
      return;
    }

    const newCar: Car = {
      id: Date.now().toString(),
      ownerId: user.id,
      brand: carForm.brand.trim(),
      model: carForm.model.trim(),
      color: carForm.color.trim() || undefined,
      plate: carForm.plate.trim() || undefined,
    };

    const shouldSaveToProfile = window.confirm(
      "Добавить эту машину в основной список ваших машин?",
    );

    if (shouldSaveToProfile) {
      const storedCars = readStoredCars();
      localStorage.setItem(
        CARS_STORAGE_KEY,
        JSON.stringify([...storedCars, newCar]),
      );
    }

    setCars((prev) => [...prev, newCar]);
    setSelectedCarId(newCar.id);
    resetCarForm();
    setIsCarFormOpen(false);
  };

  const handleCargoTextChange = <
    K extends
      | "cargoLength"
      | "cargoHeight"
      | "cargoWidth"
      | "cargoWeight"
      | "cargoVehicleType"
      | "pricePerCar",
  >(
    field: K,
    value: string,
  ) => {
    setCargoForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCargoType = (typeOption: string) => {
    setCargoForm((prev) => ({
      ...prev,
      cargoTypes: prev.cargoTypes.includes(typeOption)
        ? prev.cargoTypes.filter((item) => item !== typeOption)
        : [...prev.cargoTypes, typeOption],
    }));
  };

  const toggleCargoService = (service: string) => {
    setCargoForm((prev) => ({
      ...prev,
      cargoServices: prev.cargoServices.includes(service)
        ? prev.cargoServices.filter((item) => item !== service)
        : [...prev.cargoServices, service],
    }));
  };

  const handleStopChange = (index: number, value: string) => {
    setStops((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const addStop = () => setStops((prev) => [...prev, ""]);
  const removeStop = (index: number) =>
    setStops((prev) => prev.filter((_, i) => i !== index));

  const toggleAmenity = (key: keyof typeof amenities) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const isCargoCityTrip = tripType === "cargo" && cargoRouteMode === "city";

    if (
      !isCargoCityTrip &&
      form.fromCity.trim().toLowerCase() === form.toCity.trim().toLowerCase()
    ) {
      alert("Города отправления и прибытия не могут совпадать.");
      return;
    }

    if (!isCargoCityTrip && !form.toCity.trim()) {
      alert("Укажите город прибытия.");
      return;
    }

    if (form.date) {
      const tripDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (tripDate < today) {
        alert("Дата поездки не может быть в прошлом.");
        return;
      }
    }

    if (tripType === "passenger") {
      const freeSeats = Number(form.freeSeats);

      if (form.pricePerSeat <= 0) {
        alert("Цена за место должна быть больше нуля.");
        return;
      }

      if (passengerPriceEstimate) {
        const passengerPrice = Number(form.pricePerSeat);

        if (
          passengerPrice < passengerPriceEstimate.allowedMin ||
          passengerPrice > passengerPriceEstimate.allowedMax
        ) {
          alert(
            `Укажите цену за место в диапазоне от ${passengerPriceEstimate.allowedMin} до ${passengerPriceEstimate.allowedMax} ₽. Это помогает избегать слишком завышенных цен.`,
          );
          return;
        }
      }

      if (!Number.isInteger(freeSeats) || freeSeats < 1 || freeSeats > 8) {
        alert("Количество мест должно быть от 1 до 8.");
        return;
      }
    } else {
      if (cargoForm.cargoTypes.length === 0) {
        alert("Выберите хотя бы один тип груза.");
        return;
      }
      if (
        Number(cargoForm.cargoLength) <= 0 ||
        Number(cargoForm.cargoHeight) <= 0 ||
        Number(cargoForm.cargoWidth) <= 0
      ) {
        alert("Укажите длину, высоту и ширину груза в метрах.");
        return;
      }
      if (!cargoForm.cargoWeight.trim() || Number(cargoForm.cargoWeight) <= 0) {
        alert("Укажите допустимый вес груза в килограммах.");
        return;
      }
      if (!cargoForm.cargoVehicleType.trim()) {
        alert("Укажите тип транспорта.");
        return;
      }
      if (!cargoForm.pricePerCar.trim() || Number(cargoForm.pricePerCar) <= 0) {
        alert("Цена за машину должна быть больше нуля.");
        return;
      }
      if (cargoPriceEstimate) {
        const cargoPrice = Number(cargoForm.pricePerCar);

        if (
          cargoPrice < cargoPriceEstimate.allowedMin ||
          cargoPrice > cargoPriceEstimate.allowedMax
        ) {
          alert(
            `Укажите цену в диапазоне от ${cargoPriceEstimate.allowedMin} до ${cargoPriceEstimate.allowedMax} ₽. Это помогает избегать слишком завышенных цен.`,
          );
          return;
        }
      }
    }

    if (form.comment.length > 500) {
      alert("Комментарий не должен быть длиннее 500 символов.");
      return;
    }

    const baseTrip: Trip = {
      ...(editableTrip ?? {}),
      id: editableTrip?.id ?? Date.now().toString(),
      fromCity: form.fromCity.trim(),
      toCity: isCargoCityTrip ? "" : form.toCity.trim(),
      routeMode: tripType === "cargo" ? cargoRouteMode : "intercity",
      date: form.date,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      driver: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        rating: user.rating,
        carName: selectedCar ? getCarTitle(selectedCar) : user.carName,
      },
      pricePerSeat: form.pricePerSeat,
      freeSeats: tripType === "passenger" ? Number(form.freeSeats) : 1,
      type: tripType,
      stops:
        tripType === "passenger"
          ? stops.map((s) => s.trim()).filter(Boolean)
          : undefined,
      carId: selectedCarId || undefined,
      amenities,
      comment: form.comment.trim() || undefined,
    };

    let newTrip: Trip = baseTrip;

    if (tripType === "cargo") {
      newTrip = {
        ...baseTrip,
        freeSeats: 1,
        pricePerSeat: 0,
        cargoTypes: cargoForm.cargoTypes,
        cargoLength: Number(cargoForm.cargoLength),
        cargoHeight: Number(cargoForm.cargoHeight),
        cargoWidth: Number(cargoForm.cargoWidth),
        cargoWeight: Number(cargoForm.cargoWeight),
        cargoVehicleType: cargoForm.cargoVehicleType,
        cargoServices: cargoForm.cargoServices,
        pricePerCar: Number(cargoForm.pricePerCar),
      };
    }

    try {
      const trips = readTrips();
      const updatedTrips = isEditMode
        ? trips.map((trip) => (trip.id === newTrip.id ? newTrip : trip))
        : [...trips, newTrip];

      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updatedTrips));

      if (isEditMode) {
        setIsSaveComplete(true);
        showToast({
          type: "success",
          title: "Изменения успешно сохранены",
        });
        navigate(
          newTrip.type === "cargo"
            ? `/cargo-trip/${newTrip.id}`
            : `/trip/${newTrip.id}`,
        );
        return;
      }

      alert(
        tripType === "cargo"
          ? "Грузовая поездка создана (MVP, сохранена в localStorage)."
          : "Поездка создана (MVP, сохранена в localStorage).",
      );

      navigate(
        `/search?from=${encodeURIComponent(
          newTrip.fromCity,
        )}&to=${encodeURIComponent(newTrip.toCity)}&date=${
          newTrip.date
        }&passengers=1&tripType=${newTrip.type}&routeMode=${
          newTrip.routeMode ?? "intercity"
        }`,
      );
    } catch {
      if (isEditMode) {
        showToast({
          type: "error",
          title: "Не удалось сохранить изменения",
        });
        return;
      }

      alert("Не удалось сохранить поездку.");
    }
  };

  return (
    <div className="create-trip-page">
      <PageHeader
        title={isEditMode ? "Редактировать поездку" : "Создать поездку"}
        fallback="/profile"
      />

      {isEditMode ? (
        <p className="create-trip-edit-hint">
          Измените данные поездки и сохраните изменения
        </p>
      ) : (
        <div className="trip-type-toggle">
          <label>
            <input
              type="radio"
              className="radio-circle radio-circle--passenger"
              name="tripType"
              value="passenger"
              checked={tripType === "passenger"}
              onChange={() => setTripType("passenger")}
            />
            Пассажирская
          </label>
          <label>
            <input
              type="radio"
              className="radio-circle radio-circle--cargo"
              name="tripType"
              value="cargo"
              checked={tripType === "cargo"}
              onChange={() => setTripType("cargo")}
            />
            Грузовая
          </label>
        </div>
      )}

      <form
        className={`create-trip-form create-trip-form--${tripType}`}
        onSubmit={handleSubmit}
      >
        {isDateOrTimeChanged && (
          <div className="create-trip-warning">
            Пассажиры будут уведомлены об изменении времени поездки
          </div>
        )}

        {tripType === "cargo" && (
          <div className="form-group cargo-route-mode-group">
            <label>Тип грузовой поездки</label>
            <div className="cargo-route-mode-options">
              <label>
                <input
                  type="radio"
                  className="radio-circle radio-circle--cargo"
                  name="cargoRouteMode"
                  value="intercity"
                  checked={cargoRouteMode === "intercity"}
                  onChange={() => setCargoRouteMode("intercity")}
                />
                По межгороду
              </label>
              <label>
                <input
                  type="radio"
                  className="radio-circle radio-circle--cargo"
                  name="cargoRouteMode"
                  value="city"
                  checked={cargoRouteMode === "city"}
                  onChange={() => setCargoRouteMode("city")}
                />
                По городу
              </label>
            </div>
          </div>
        )}

        <label>
          {tripType === "cargo" && cargoRouteMode === "city" ? "Город" : "Откуда"}
          <input
            type="text"
            value={form.fromCity}
            onChange={(e) => handleChange("fromCity", e.target.value)}
            required
          />
        </label>

        {!(tripType === "cargo" && cargoRouteMode === "city") && (
          <label>
            Куда
            <input
              type="text"
              value={form.toCity}
              onChange={(e) => handleChange("toCity", e.target.value)}
              required
            />
          </label>
        )}

        {tripType === "passenger" && (
          <div className="form-group">
            <label>Промежуточные остановки</label>
            {stops.map((stop, index) => (
              <div key={index} className="stop-row">
                <input
                  type="text"
                  placeholder={`Остановка ${index + 1}`}
                  value={stop}
                  onChange={(e) => handleStopChange(index, e.target.value)}
                />
                {stops.length > 1 && (
                  <button type="button" onClick={() => removeStop(index)}>
                    Удалить
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addStop}>
              Добавить остановку
            </button>
          </div>
        )}

        <label>
          Дата
          <input
            type="date"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            required
          />
        </label>

        <label>
          Время выезда
          <input
            type="time"
            value={form.departureTime}
            onChange={(e) => handleChange("departureTime", e.target.value)}
            required
          />
        </label>

        <label>
          Время прибытия
          <input
            type="time"
            value={form.arrivalTime}
            onChange={(e) => handleChange("arrivalTime", e.target.value)}
          />
        </label>

        <div className="form-group">
          <label>Машина для поездки</label>
          {cars.length === 0 ? (
            <p>У вас ещё нет добавленных машин.</p>
          ) : (
            <select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
            >
              <option value="">Выберите машину</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {getCarTitle(car)}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="create-trip-add-car-button"
            onClick={() => setIsCarFormOpen((isOpen) => !isOpen)}
          >
            {isCarFormOpen ? "Скрыть форму" : "Добавить машину"}
          </button>

          {isCarFormOpen && (
            <div className="car-form create-trip-car-form">
              <div className="form-row form-row_2">
                <label className="form-field">
                  Марка
                  <input
                    type="text"
                    placeholder="Lada"
                    value={carForm.brand}
                    onChange={(e) => handleCarChange("brand", e.target.value)}
                    required
                  />
                </label>

                <label className="form-field">
                  Модель
                  <input
                    type="text"
                    placeholder="Kalina"
                    value={carForm.model}
                    onChange={(e) => handleCarChange("model", e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="form-row form-row_2">
                <label className="form-field">
                  Цвет
                  <input
                    type="text"
                    placeholder="Серый"
                    value={carForm.color}
                    onChange={(e) => handleCarChange("color", e.target.value)}
                  />
                </label>

                <label className="form-field">
                  Госномер
                  <input
                    type="text"
                    placeholder="2ОРУ67"
                    value={carForm.plate}
                    onChange={(e) => handleCarChange("plate", e.target.value)}
                  />
                </label>
              </div>

              <p className="hint-text">
                После добавления машина будет выбрана для этой поездки. Система
                отдельно спросит, сохранять ли её в основном списке ваших машин.
              </p>

              <div className="car-form-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleAddCar}
                >
                  Сохранить машину
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    resetCarForm();
                    setIsCarFormOpen(false);
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        {tripType === "passenger" ? (
          <>
            {passengerPriceEstimate && (
              <div className="cargo-price-recommendation">
                <div className="cargo-price-recommendation__header">
                  <span>Рекомендованная стоимость за место</span>
                  <strong>
                    {passengerPriceEstimate.recommendedMin}–
                    {passengerPriceEstimate.recommendedMax} ₽
                  </strong>
                </div>
                <p>
                  Рекомендуемая цена рассчитана с учётом маршрута и условий
                  поездки.
                </p>
                <div className="cargo-price-recommendation__meta">
                  <span>
                    Маршрут: около {passengerPriceEstimate.distanceKm} км
                  </span>
                  <span>
                    Допустимо: {passengerPriceEstimate.allowedMin}–
                    {passengerPriceEstimate.allowedMax} ₽
                  </span>
                </div>
                <button
                  type="button"
                  className="cargo-price-recommendation__button"
                  onClick={() =>
                    handleChange(
                      "pricePerSeat",
                      passengerPriceEstimate.recommendedPrice,
                    )
                  }
                >
                  Поставить рекомендованную цену
                </button>
              </div>
            )}

            <label>
              Цена за место (₽)
              <input
                type="number"
                min={0}
                step={50}
                value={form.pricePerSeat}
                onChange={(e) => handleChange("pricePerSeat", e.target.value)}
                required
              />
            </label>

            <label>
              Свободных мест
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={8}
                step={1}
                value={form.freeSeats}
                onChange={(e) => handleChange("freeSeats", e.target.value)}
                required
              />
            </label>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Тип груза, который готовы везти</label>
              <div className="amenities">
                {cargoTypeOptions.map((option) => (
                  <label key={option}>
                    <input
                      type="checkbox"
                      className="checkbox-square checkbox-square--cargo"
                      checked={cargoForm.cargoTypes.includes(option)}
                      onChange={() => toggleCargoType(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="cargo-dimensions-group">
              <label>
                Длина груза (м)
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  inputMode="decimal"
                  value={cargoForm.cargoLength}
                  onChange={(e) =>
                    handleCargoTextChange("cargoLength", e.target.value)
                  }
                  required
                />
              </label>
              <label>
                Высота груза (м)
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  inputMode="decimal"
                  value={cargoForm.cargoHeight}
                  onChange={(e) =>
                    handleCargoTextChange("cargoHeight", e.target.value)
                  }
                  required
                />
              </label>
              <label>
                Ширина груза (м)
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  inputMode="decimal"
                  value={cargoForm.cargoWidth}
                  onChange={(e) =>
                    handleCargoTextChange("cargoWidth", e.target.value)
                  }
                  required
                />
              </label>
            </div>

            <label>
              Допустимый вес груза (кг)
              <input
                type="number"
                min={0}
                step={1}
                inputMode="decimal"
                value={cargoForm.cargoWeight}
                onChange={(e) =>
                  handleCargoTextChange("cargoWeight", e.target.value)
                }
                required
              />
            </label>

            <label>
              Тип транспорта
              <select
                value={cargoForm.cargoVehicleType}
                onChange={(e) =>
                  handleCargoTextChange("cargoVehicleType", e.target.value)
                }
                required
              >
                <option value="">Выберите тип транспорта</option>
                {cargoVehicleTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-group">
              <label>Дополнительные услуги</label>
              <div className="amenities">
                {cargoServiceOptions.map((service) => (
                  <label key={service}>
                    <input
                      type="checkbox"
                      className="checkbox-square checkbox-square--cargo"
                      checked={cargoForm.cargoServices.includes(service)}
                      onChange={() => toggleCargoService(service)}
                    />
                    {service}
                  </label>
                ))}
              </div>
            </div>

            {cargoPriceEstimate && (
              <div className="cargo-price-recommendation">
                <div className="cargo-price-recommendation__header">
                  <span>Рекомендованная стоимость</span>
                  <strong>
                    {cargoPriceEstimate.recommendedMin}–
                    {cargoPriceEstimate.recommendedMax} ₽
                  </strong>
                </div>
                <p>
                  Рекомендуемая цена рассчитана с учётом маршрута, габаритов
                  груза, веса и дополнительных услуг.
                </p>
                <div className="cargo-price-recommendation__meta">
                  <span>Маршрут: около {cargoPriceEstimate.distanceKm} км</span>
                  <span>
                    Допустимо: {cargoPriceEstimate.allowedMin}–
                    {cargoPriceEstimate.allowedMax} ₽
                  </span>
                </div>
                <button
                  type="button"
                  className="cargo-price-recommendation__button"
                  onClick={() =>
                    handleCargoTextChange(
                      "pricePerCar",
                      String(cargoPriceEstimate.recommendedPrice),
                    )
                  }
                >
                  Поставить рекомендованную цену
                </button>
              </div>
            )}

            <label>
              Цена за машину (₽)
              <input
                type="number"
                min={0}
                step={50}
                value={cargoForm.pricePerCar}
                onChange={(e) =>
                  handleCargoTextChange("pricePerCar", e.target.value)
                }
                required
              />
            </label>
          </>
        )}

        {tripType === "passenger" && (
          <div className="form-group">
            <label>Удобства для пассажиров</label>
            <div className="amenities">
              <label>
                <input
                  type="checkbox"
                  className="checkbox-square checkbox-square--passenger"
                  checked={amenities.childSeat}
                  onChange={() => toggleAmenity("childSeat")}
                />
                Есть детское кресло
              </label>
              <label>
                <input
                  type="checkbox"
                  className="checkbox-square checkbox-square--passenger"
                  checked={amenities.petsAllowed}
                  onChange={() => toggleAmenity("petsAllowed")}
                />
                Можно с животными
              </label>
              <label>
                <input
                  type="checkbox"
                  className="checkbox-square checkbox-square--passenger"
                  checked={amenities.smokingAllowed}
                  onChange={() => toggleAmenity("smokingAllowed")}
                />
                Можно курить
              </label>
              <label>
                <input
                  type="checkbox"
                  className="checkbox-square checkbox-square--passenger"
                  checked={amenities.luggageAllowed}
                  onChange={() => toggleAmenity("luggageAllowed")}
                />
                Можно с багажом
              </label>
            </div>
          </div>
        )}

        <label>
          Комментарий
          <textarea
            value={form.comment}
            onChange={(e) => handleChange("comment", e.target.value)}
            placeholder={
              tripType === "passenger"
                ? "Например: еду с ребёнком, можно с животными, курение только на остановках."
                : "Например: помогу с погрузкой, заезд во двор, есть тележка."
            }
          />
        </label>

        <button type="submit">
          {isEditMode ? "Сохранить изменения" : "Опубликовать поездку"}
        </button>
      </form>
    </div>
  );
};

export default CreateTripPage;
